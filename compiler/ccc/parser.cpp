//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#include <sstream>
#include <stack>
#include "parser.h"
#include "lexer.h"
#include "environment.h"
#include "parsetree.h"
#include "util.h"

namespace ccc
{

// parses the program
ParseTree* Parser::parse(Lexer* lexer)
{
    _lexer = lexer;
    _lineNumber = -lexer->initialLineNumber();
    _env = new Environment();

    // setting up the env
    for(std::set<std::string>::iterator it=lexer->functions().begin(); it!=lexer->functions().end(); ++it)
        _env->putFunction(*it, new EnvironmentFunction(*it, lexer->functionArity(*it)));

    for(std::set<std::string>::iterator it=lexer->globalVariables().begin(); it!=lexer->globalVariables().end(); ++it)
        _env->putVariable(*it, new EnvironmentStaticVariable());

    // parsing
    _getsym();
    ParseTree* p = _program();

    // bye
    delete _env;
    return p;
}

// next symbol
void Parser::_getsym()
{
    _sym = _lexer->getToken();
    _nextSym = _lexer->getToken();
    _lexer->ungetToken(_nextSym);
    if(_sym.type() == NEWLINE)
        _lineNumber++;
}

// accepts a symbol
bool Parser::_accept(TokenType tt)
{
    if(_sym.type() == tt) {
        _getsym();
        return true;
    }
    else
        return false;
}

// expects a symbol
bool Parser::_expect(TokenType tt) throw(ParseError)
{
    if(!_accept(tt)) {
        throw ParseError((((std::string("Expected a ") + Token::typeToString(tt)) + ", not a ") + _sym.typeName()) + ".", _lineNumber);
        return false;
    }
    else
        return true;
}

// pushes a new environment
Environment* Parser::_pushEnv()
{
    return (_env = new Environment(_env));
}

// pops an existing environment
void Parser::_popEnv()
{
    Environment *p = _env->parent();
    if(p != NULL) {
        delete _env;
        _env = p;
    }
}

// non-terminal program
ParseTree* Parser::_program()
{
    ParseTree* p = _stmts();

    _expect(ENDOFFILE);
    if(_currentBlock != BT_NONE)
        throw ParseError("Unexpected end of file. Did you forget to close some if/while/for/do/fun?", _lineNumber);

    return p;
}

// non-terminal statement list
ParseTree* Parser::_stmts()
{
    // matches ('\n')*
    while(_accept(NEWLINE));

    // FIRST(stmts) = { ... }
    switch(_sym.type()) {
        case IDENTIFIER:
        case ASM:
        case POKE:
        case FUN:
        case RETURN:
        case BREAK:
        case DO:
        case FOR:
        case WHILE:
        case IF:
            return new Stmts(_stmt(), _stmts()); // TODO tirar recursao

        case LOOP:
        case NEXT:
        case WEND:
        case ELSEIF:
        case ELSE:
        case ENDIF:
        case ENDFUN:
            return _stmt();

        case ENDOFFILE:
            return new EmptyTree();

        default:
            throw ParseError((std::string("Invalid statement: unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
    }

    return new EmptyTree();
}

// non-terminal statement
ParseTree* Parser::_stmt()
{
    switch(_sym.type()) {
        case IDENTIFIER: {
            std::string id = _sym.lexeme();
            _accept(IDENTIFIER);
            if(_sym.type() == ASSIGNOP) {
                // assignment operation
                if(_env->getFunction(id) != NULL)
                    throw ParseError((std::string("Conflicting names for function/variable \"") + id) + "\".", _lineNumber);
                std::string op = _sym.lexeme();
                _accept(ASSIGNOP);
                ParseTree* p = new Assign(op, _env->getVariable(id), _expr());
                _expect(NEWLINE);
                return p;
            }
            else if(_sym.type() == LSQBRACKET) {
                // set table entry:
                // table[ expression ] = expression
                _accept(LSQBRACKET);
                ParseTree* key = _expr();
                _expect(RSQBRACKET);
                std::string op = _sym.lexeme();
                _expect(ASSIGNOP);
                ParseTree* value = _expr();
                _expect(NEWLINE);
                return new SetTableEntry(op, _env->getVariable(id), key, value);
            }
            else if(_env->getFunction(id) != NULL) {
                // procedure call
                std::list<ParseTree*> params;
                const EnvironmentFunction* fun = _env->getFunction(id);

                if(!_accept(NEWLINE)) {
                    bool paren = _accept(LPAREN);

                    if(_sym.type() != RPAREN) {
                        do {
                            params.push_back(_expr());
                        } while(_accept(COMMA));
                    }

                    if(paren) _expect(RPAREN);
                    _expect(NEWLINE);
                }

                if(int(params.size()) != fun->arity()) {
                    std::stringstream ss;
                    ss << "Function \"" << id << "\" requires " << fun->arity() << " parameter" <<
                    (fun->arity() == 1 ? "" : "s") << ", but " << int(params.size()) << " " <<
                    (int(params.size()) == 1 ? "was" : "were") << " given.";
                    throw ParseError(ss.str(), _lineNumber);
                }

                return new ProcedureCall(fun, params);
            }
            else
                throw ParseError((std::string("Unknown function \"") + id) + "\".", _lineNumber);
            break;
        }

        case ASM: {
            // inline assembly
            _accept(ASM);
            if(_sym.type() == STRING) {
                ParseTree* p = new Assembly(_sym.lexeme());
                _accept(STRING);
                _expect(NEWLINE);
                return p;
            }
            else
                _expect(STRING);
            break;
        }

        case POKE: {
            // poke
            _accept(POKE);
            ParseTree* addr = _expr();
            _expect(COMMA);
            ParseTree* value = _expr();
            _expect(NEWLINE);
            return new Poke(addr, value);
        }

        case IF: {
            // if command
            BlockType oldBlock = _currentBlock;
            _currentBlock = BT_IF;

            ParseTree* result = NULL;
            ParseTree* condition = NULL;

            _accept(IF);
            condition = _expr();
            _expect(THEN);

            if(_accept(NEWLINE)) {
                // if block
                std::stack< std::pair<ParseTree*,ParseTree*> > stack;
                ParseTree* yes;
                ParseTree* no;

                yes = _stmts();

                while(_accept(ELSEIF)) {
                    ParseTree* cond = _expr();
                    _expect(THEN);
                    _expect(NEWLINE);
                    ParseTree* block = _stmts();
                    stack.push(std::make_pair(cond, block));
                }

                if(_accept(ELSE)) {
                    _expect(NEWLINE);
                    no = _stmts();
                }
                else
                    no = new EmptyTree();

                _expect(ENDIF);
                _expect(NEWLINE);

                while(!stack.empty()) {
                    no = new If(stack.top().first, stack.top().second, no);
                    stack.pop();
                }

                result = new If(condition, yes, no);
            }
            else {
                // inline if
                if(_sym.type() == IDENTIFIER || _sym.type() == ASM || _sym.type() == BREAK || _sym.type() == RETURN || _sym.type() == POKE)
                    result = new If(condition, _stmt());
                else
                    throw ParseError((std::string("Invalid inline if; unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
            }

            _currentBlock = oldBlock;
            return result;
        }

        case ELSEIF:
            if(_currentBlock != BT_IF)
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
            break;

        case ELSE:
            if(_currentBlock != BT_IF)
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
            break;

        case ENDIF:
            if(_currentBlock != BT_IF)
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
            break;

        case DO: {
            // do ... loop
            BlockType oldBlock = _currentBlock;
            _currentBlock = BT_DO;
            _accept(DO);
            _expect(NEWLINE);

            bool oldInALoop = _inALoop;
            _inALoop = true;
            ParseTree* result = new Do(_stmts());
            _inALoop = oldInALoop;

            _expect(LOOP);
            _expect(NEWLINE);
            _currentBlock = oldBlock;
            return result;
        }

        case LOOP:
            if(_currentBlock != BT_DO)
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
            break;

        case BREAK: {
            if(_inALoop) {
                _accept(BREAK);
                return new Break();
            }
            else
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\": this command may only be used in loops.", _lineNumber);
            break;
        }

        case WHILE: {
            // while ... wend
            BlockType oldBlock = _currentBlock;
            _currentBlock = BT_WHILE;
            _accept(WHILE);
            ParseTree* condition = _expr();
            _expect(NEWLINE);

            bool oldInALoop = _inALoop;
            _inALoop = true;
            ParseTree* result = new While(condition, _stmts());
            _inALoop = oldInALoop;

            _expect(WEND);
            _expect(NEWLINE);
            _currentBlock = oldBlock;
            return result;
        }

        case WEND:
            if(_currentBlock != BT_WHILE)
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
            break;

        case FOR: {
            // for loop
            ParseTree* result = NULL;
            BlockType oldBlock = _currentBlock;
            _currentBlock = BT_FOR;

            _accept(FOR);
            std::string varname = _sym.lexeme();
            _expect(IDENTIFIER);
            if(_sym.lexeme() == "=" && _accept(ASSIGNOP)) {
                ParseTree* initialValue = _expr();
                _expect(TO);
                ParseTree* finalValue = _expr();

                bool oldInALoop = _inALoop;
                _inALoop = true;
                if(_accept(STEP)) {
                    // for var = t0 to t step s
                    ParseTree* stepValue = _expr();
                    _expect(NEWLINE);
                    result = new For(_env->getVariable(varname), initialValue, finalValue, stepValue, _stmts());
                }
                else {
                    // for var = t0 to t
                    _expect(NEWLINE);
                    result = new For(_env->getVariable(varname), initialValue, finalValue, _stmts());
                }
                _inALoop = oldInALoop;
            }
            else if(_accept(IN)) { // for var in collection
                std::string tableName = _sym.lexeme();
                _expect(IDENTIFIER);
                _expect(NEWLINE);

                bool oldInALoop = _inALoop;
                _inALoop = true;
                result = new ForEach(_env->getVariable(varname), _env->getVariable(tableName), _stmts());
                _inALoop = oldInALoop;
            }
            else
                throw ParseError((std::string("Expected a \"=\" or a \"in\" in the for loop, not a \"") + _sym.lexeme()) + "\".", _lineNumber);

            _expect(NEXT);
            _expect(NEWLINE);
            _currentBlock = oldBlock;
            return result;
        }

        case NEXT:
            if(_currentBlock != BT_FOR)
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
            break;

        case FUN: {
            // function definition
            if(_currentBlock == BT_NONE) {
                ParseTree* result = NULL;
                bool oldInAFunction = _inAFunction;
                _inAFunction = true;
                BlockType oldBlock = _currentBlock;
                _currentBlock = BT_FUN;
                _pushEnv();

                _accept(FUN);
                std::string funname = _sym.lexeme();
                if(!_accept(IDENTIFIER))
                    throw ParseError((std::string("Expected a function name, but received a \"") + _sym.lexeme()) + "\".", _lineNumber);
                _expect(LPAREN);

                /*
                ;
                ; [ ...         ]                   Esquema da
                ; [ var locais  ]  <--- BP          pilha
                ; [ BP antigo   ]
                ; [ RET address ]
                ; [ parametro 1 ]                   Enderecos de
                ; [ parametro 2 ]                   memoria crescem
                ; [ ...         ]                   de cima para
                ; [ parametro n ]                   baixo
                ; [ ...         ]
                */

                std::list<const EnvironmentVariable*> paramList;
                if(_sym.type() != RPAREN) {
                    int offset = 3;
                    do {
                        if(_sym.type() == IDENTIFIER) {
                            paramList.push_back(_env->putVariable(_sym.lexeme(), new EnvironmentStackVariable(offset++)));
                            _accept(IDENTIFIER);
                        }
                        else
                            throw ParseError((std::string("Expected a parameter name in the function definition, but received a \"") + _sym.lexeme()) + "\" instead.", _lineNumber);
                    } while(_accept(COMMA));
                }

                const EnvironmentFunction* fun = _env->getFunction(funname);
                if(int(paramList.size()) != fun->arity()) {
                    std::stringstream ss;
                    ss << "Conflicting arity for lexer (" << fun->arity() << ")/parser (" << paramList.size() << ") analysis in function \"" << funname << "\". This shouldn't happen.";
                    throw ParseError(ss.str(), _lineNumber);
                }

                _expect(RPAREN);
                _expect(NEWLINE);

                ParseTree* block = _stmts(); // this call comes before _env->numberOfLocalVariables()
                result = new Fun(fun, _env->numberOfLocalVariables(), block);

                _expect(ENDFUN);
                _expect(NEWLINE);

                _popEnv();
                _currentBlock = oldBlock;
                _inAFunction = oldInAFunction;
                return result;
            }
            else
                throw ParseError("Functions can only be defined in the global scope.", _lineNumber);
            break;
        }

        case RETURN:
            if(_inAFunction) {
                _accept(RETURN);
                if(_accept(NEWLINE))
                    return new Return();
                else
                    return new Return(_expr());
            }
            else
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\": this command may only be used inside functions.", _lineNumber);
            break;

        case ENDFUN:
            if(_currentBlock != BT_FUN)
                throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\".", _lineNumber);
            break;

        default: {
            throw ParseError((std::string("Unexpected \"") + _sym.lexeme()) + "\"", _lineNumber);
            break;
        }
    }

    return new EmptyTree();
}

// an expression
ParseTree* Parser::_expr()
{
    return _logicexpr();
}

// logic expression
ParseTree* Parser::_logicexpr()
{
    ParseTree *me, *left, *right;

    me = left = _cmpexpr();
    while(_sym.type() == BINARYOP && (strtolower(_sym.lexeme()) == "and" || strtolower(_sym.lexeme()) == "or" || strtolower(_sym.lexeme()) == "xor")) {
        std::string op = _sym.lexeme();
        _accept(BINARYOP);
        right = _cmpexpr();
        me = new BinaryOp(op, left, right);
        left = me;
    }

    return me;
}

// comparing expression
ParseTree* Parser::_cmpexpr()
{
    ParseTree *me, *left, *right;

    me = left = _ariexpr();
    if(_sym.type() == BINARYOP && (_sym.lexeme() == "=" || _sym.lexeme() == "<>" || _sym.lexeme() == ">" || _sym.lexeme() == ">=" || _sym.lexeme() == "<" || _sym.lexeme() == "<=")) {
        std::string op = _sym.lexeme();
        _accept(BINARYOP);
        right = _ariexpr();
        me = new BinaryOp(op, left, right);
    }

    return me;
}

// (basic) arithmetic expression
ParseTree* Parser::_ariexpr()
{
    ParseTree *me, *left, *right;

    me = left = _termexpr();
    while(_sym.type() == BINARYOP && (_sym.lexeme() == "+" || _sym.lexeme() == "-")) {
        std::string op = _sym.lexeme();
        _accept(BINARYOP);
        right = _termexpr();
        me = new BinaryOp(op, left, right);
        left = me;
    }

    return me;
}

// (term) arithmetic expression
ParseTree* Parser::_termexpr()
{
    ParseTree *me, *left, *right;

    me = left = _unaryexpr();
    while(_sym.type() == BINARYOP && (_sym.lexeme() == "*" || _sym.lexeme() == "/" || strtolower(_sym.lexeme()) == "mod")) {
        std::string op = _sym.lexeme();
        _accept(BINARYOP);
        right = _powerexpr();
        me = new BinaryOp(op, left, right);
        left = me;
    }

    return me;
}

// (unary) arithmetic expression
ParseTree* Parser::_unaryexpr()
{
    if(_sym.type() == UNARYOP) {
        std::string op = _sym.lexeme();
        _accept(UNARYOP);
        return new UnaryOp(op, _powerexpr());
    }
    else
        return _powerexpr();
}

// (power) arithmetic expression
ParseTree* Parser::_powerexpr()
{
    ParseTree *me, *left, *right;

    me = left = _factorexpr();
    if(_sym.type() == BINARYOP && (_sym.lexeme() == "^")) {
        std::string op = _sym.lexeme();
        _accept(BINARYOP);
        right = _factorexpr();
        me = new BinaryOp(op, left, right);
    }

    return me;
}

// factor expressioon
ParseTree* Parser::_factorexpr()
{
    switch(_sym.type()) {
    case LPAREN: {
        _accept(LPAREN);
        ParseTree* p = _expr();
        _expect(RPAREN);
        return p;
    }
    case NUMBER: {
        std::string num = _sym.lexeme();
        _accept(NUMBER);
        return new Number(num);
    }
    case STRING: {
        std::string str = _sym.lexeme();
        _accept(STRING);
        return new String(str);
    }
    case BOOLEAN: {
        std::string bol = _sym.lexeme();
        _accept(BOOLEAN);
        return new Boolean(bol);
    }
    case ADDROF: {
        std::string id;
        _accept(ADDROF);
        if(_accept(LPAREN)) {
            id = _sym.lexeme();
            _expect(IDENTIFIER);
            _expect(RPAREN);
        }
        else {
            id = _sym.lexeme();
            _expect(IDENTIFIER);
        }
        return new AddressOfVariable(_env->getVariable(id));
    }
    case PEEK: {
        _accept(PEEK);
        _expect(LPAREN);
        ParseTree* p = new Peek(_expr());
        _expect(RPAREN);
        return p;
    }
    case IDENTIFIER: {
        std::string id = _sym.lexeme();
        _accept(IDENTIFIER);
        if(_env->getFunction(id) != NULL) {
            // function call
            std::list<ParseTree*> params;
            const EnvironmentFunction* fun = _env->getFunction(id);

            _expect(LPAREN);
            if(_sym.type() != RPAREN) {
                do {
                    params.push_back(_expr());
                } while(_accept(COMMA));
            }
            _expect(RPAREN);

            if(int(params.size()) != fun->arity()) {
                std::stringstream ss;
                ss << "Function \"" << id << "\" requires " << fun->arity() << " parameter" <<
                (fun->arity() == 1 ? "" : "s") << ", but " << int(params.size()) << " " <<
                (int(params.size()) == 1 ? "was" : "were") << " given.";
                throw ParseError(ss.str(), _lineNumber);
            }

            return new FunctionCall(fun, params);
        }
        else if(_sym.type() == LSQBRACKET) {
            // get table entry
            _accept(LSQBRACKET);
            ParseTree* expr = _expr();
            _expect(RSQBRACKET);
            return new GetTableEntry(_env->getVariable(id), expr);
        }
        else if(_sym.type() == LPAREN) {
            throw ParseError(std::string("Unknown function \"") + id + "\"", _lineNumber+1);
        }
        else {
            // ordinary variable
            return new Variable(_env->getVariable(id));
        }
    }
    }

    throw ParseError((std::string("Expected an expression, not a \"") + _sym.lexeme()) + "\", which is a " + Token::typeToString(_sym.type()), _lineNumber);
    return new Number("0");
}

} // namespace ccc
