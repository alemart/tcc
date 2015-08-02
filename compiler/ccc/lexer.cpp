//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#include <cctype>
#include <sstream>
#include "lexer.h"
#include "util.h"

#define IS_IDCHAR(x)        (std::isalnum(x) || (x) == '_' || (x) == '?' || (x) == '$' || (x) == '#')

namespace ccc
{

// constructor
Lexer::Lexer(int initialLineNum) : _lineNumber(1-initialLineNum), _initialLineNumber(initialLineNum)
{
    _reserve(BOOLEAN, "true");
    _reserve(BOOLEAN, "false");
    _reserve(COMMA, ",");
    _reserve(DOT, ".");
    _reserve(NEWLINE, "\n");
    _reserve(LPAREN, "(");
    _reserve(RPAREN, ")");
    _reserve(LSQBRACKET, "[");
    _reserve(RSQBRACKET, "]");
    _reserve(LCURLYBRACE, "{");
    _reserve(RCURLYBRACE, "}");
    _reserve(UNARYOP, "not");
    _reserve(BINARYOP, "+"); // don't worry about unary plus here
    _reserve(BINARYOP, "-"); // don't worry about unary minus here
    _reserve(BINARYOP, "*");
    _reserve(BINARYOP, "/");
    _reserve(BINARYOP, "^");
    _reserve(BINARYOP, "mod");
    _reserve(BINARYOP, "and");
    _reserve(BINARYOP, "or");
    _reserve(BINARYOP, "xor");
    _reserve(ASSIGNOP, "+=");
    _reserve(ASSIGNOP, "-=");
    _reserve(ASSIGNOP, "*=");
    _reserve(ASSIGNOP, "/=");
    _reserve(ASSIGNOP, "^=");
    _reserve(BINARYOP, "="); // don't worry about assignment op here
    _reserve(BINARYOP, "<>");
    _reserve(BINARYOP, "<");
    _reserve(BINARYOP, ">");
    _reserve(BINARYOP, "<=");
    _reserve(BINARYOP, ">=");
    _reserve(FUN, "fun");
    _reserve(ENDFUN, "endfun");
    _reserve(RETURN, "return");
    _reserve(IF, "if");
    _reserve(THEN, "then");
    _reserve(ELSEIF, "elseif");
    _reserve(ELSE, "else");
    _reserve(ENDIF, "endif");
    _reserve(WHILE, "while");
    _reserve(WEND, "wend");
    _reserve(DO, "do");
    _reserve(LOOP, "loop");
    _reserve(FOR, "for");
    _reserve(TO, "to");
    _reserve(STEP, "step");
    _reserve(IN, "in");
    _reserve(NEXT, "next");
    _reserve(BREAK, "break");
    _reserve(ADDROF, "__addrof");
    _reserve(ASM, "__asm");
    _reserve(PEEK, "__peek");
    _reserve(POKE, "__poke");
}

// destructor
Lexer::~Lexer()
{
}

// initial line number
int Lexer::initialLineNumber() const
{
    return _initialLineNumber;
}

// reserve
inline void Lexer::_reserve(TokenType type, const std::string& lexeme)
{
    _words[lexeme] = Token(type, lexeme);
}

// scan token
Token Lexer::_scan(const std::string& line, int len, int& i) throw(LexicalError)
{
    static Token prev; // previous token
    static bool equalAsAnAssignmentOp = true;
    std::string lexeme;

    // skip spaces
    while(i < len && std::isspace((int)line[i]))
        i++;
    if(i < len && line[i] == '\'') // comment
        i = len;
    if(i == len)
        return prev = Token(NEWLINE, "\n"); // end of line

    // assignment operator
    switch(prev.type()) {
    case IF: case ELSEIF: case WHILE: case RETURN: case PEEK:
        equalAsAnAssignmentOp = false;
        break;
    case THEN: case NEWLINE:
        equalAsAnAssignmentOp = true;
        break;
    default:
        break;
    }
    if(line[i] == '=' && equalAsAnAssignmentOp)
        return prev = Token(ASSIGNOP, std::string("") + line[i++]);

    // read string
    if(line[i] == '"') {
        bool backslash = false;

        for(lexeme = line[i++]; ; i++) {
            if(i >= len)
                throw LexicalError("unexpected end of string", line, _lineNumber);

            lexeme += line[i];

            if(backslash) {
                backslash = false;
                if(line[i] != 'n' && line[i] != 't' && line[i] != '\\' && line[i] != '"')
                    throw LexicalError((std::string("invalid symbol: '\\") + line[i]) + "'", line, _lineNumber);
            }
            else if(line[i] == '"') {
                i++;
                break;
            }
            else if(line[i] == '\\')
                backslash = true;
        }

        return prev = Token(STRING, lexeme);
    }

    // read number
    if(std::isdigit(int(line[i]))) {// || ((line[i] == '-' || line[i] == '+') && prev.type() != LPAREN && e outros tokens... && prev.type() != NUMBER && i+1<len && std::isdigit(int(line[i+1])))) {
        bool gotDot = false;

        lexeme = line[i++];
        for(; i < len; i++) {
            if(std::isdigit(int(line[i])) || line[i] == '.') {
                lexeme += line[i];
                if(line[i] == '.') {
                    if(gotDot || !(i+1<len && std::isdigit(int(line[i+1]))))
                        throw LexicalError("unknown symbol", line, _lineNumber);
                    else
                        gotDot = true;
                }
            }
            else
                break;
        }

        return prev = Token(NUMBER, lexeme);
    }

    // unary '+' '-'
    if(line[i] == '-' || line[i] == '+') {
        switch(prev.type()) {
        case LPAREN: case UNARYOP: case BINARYOP: case ASSIGNOP: case COMMA: case LSQBRACKET:
        case LCURLYBRACE: case IF: case ELSEIF: case WHILE: case TO: case STEP: case RETURN:
            return prev = Token(UNARYOP, std::string("") + line[i++]);

        case IDENTIFIER:
            if(functionArity(prev.lexeme()) >= 0) // procedure call
                return prev = Token(UNARYOP, std::string("") + line[i++]);
            else
                break;

        default:
            break;
        }
    }

    // read some special identifier
    if(IS_IDCHAR(line[i]) && !std::isdigit(int(line[i]))) {
        lexeme = line[i++];
        while(i < len && IS_IDCHAR(line[i]))
            lexeme += line[i++];

        std::map<std::string,Token>::iterator it = _words.find(strtolower(lexeme));
        return prev = (it == _words.end()) ? Token(IDENTIFIER, strtolower(lexeme)) : it->second;
    }

    // read some other symbol like ^, >=, etc
    while(i < len && !std::isspace(int(line[i])) && !IS_IDCHAR(line[i]) && _words.find(lexeme) == _words.end())//lexeme != "(" && lexeme != "[" && lexeme != "{" && lexeme != ")" && lexeme != "]" && lexeme != "}")
        lexeme += line[i++];
    if(i < len && _words.find(lexeme + line[i]) != _words.end())
        lexeme += line[i++];

    std::map<std::string,Token>::iterator it = _words.find(lexeme);
    if(it == _words.end()) {
        throw LexicalError((std::string("unknown symbol '") + lexeme) + "'", line, _lineNumber);
        return prev = Token(UNKNOWN, lexeme);
    }
    else
        return prev = it->second;
}

// feed line
void Lexer::feedLine(const std::string& rawLine) throw(LexicalError)
{
    Token t;
    std::string line(trim(rawLine));
    int i = 0, len = (int)line.length();

    do {
        t = _scan(line, len, i);
        _tokens.push_back(t);
        _scanDeclarations(t);
    } while(t.type() != NEWLINE);

    ++_lineNumber;
}

// retrieve next token
Token Lexer::getToken()
{
    if(_tokens.size() > 0) {
        Token t = _tokens.front();
        _tokens.pop_front();
        return t;
    }
    else
        return Token(ENDOFFILE, "");
}

// unget token
void Lexer::ungetToken(Token t)
{
    if(t.type() != ENDOFFILE)
        _tokens.push_front(t);
}

// -1 if funName does not exist
int Lexer::functionArity(const std::string& funName) const
{
    std::map<std::string,int>::const_iterator it = _funArity.find(strtolower(funName));
    return it != _funArity.end() ? it->second : -1;
}

// functions
const std::set<std::string>& Lexer::functions() const
{
    static std::set<std::string> s;
    std::map<std::string,int>::const_iterator it;

    s.clear();
    for(it = _funArity.begin(); it != _funArity.end(); ++it)
        s.insert(it->first);

    return s;
}

// globals
const std::set<std::string>& Lexer::globalVariables() const
{
    return _globals;
}

// scan function/global variable declarations
inline void Lexer::_scanDeclarations(const Token& t)
{
    static enum { S_NOTHING, S_FUN, S_FUNNAME, S_LPAREN, S_ARGUMENT, S_COMMA, S_WAITFORENDFUN } state = S_NOTHING;
    static std::string name = "";
    static int arity = 0;

    switch(state) {
    case S_NOTHING:
        if(t.type() == IDENTIFIER && IS_GLOBALVAR(t.lexeme()))
            _globals.insert(strtolower(t.lexeme()));
        else if(t.type() == FUN)
            state = S_FUN;
        break;

    case S_FUN:
        if(t.type() == IDENTIFIER) {
            state = S_FUNNAME;
            name = strtolower(t.lexeme());
            arity = 0;
            if(IS_GLOBALVAR(name))
                throw LexicalError("Invalid function name", name, _lineNumber);
            else if(name.length() < 2)
                throw LexicalError("Function names must be at least 2 characters long", name, _lineNumber);
        }
        else
            state = S_NOTHING;
        break;

    case S_FUNNAME:
        if(t.type() == NEWLINE) {
            state = S_WAITFORENDFUN;
            if(_funArity.find(name) != _funArity.end())
                throw LexicalError("Duplicate function name", name, _lineNumber);
            else
                _funArity[name] = arity;
        }
        else
            state = (t.type() == LPAREN) ? S_LPAREN : S_NOTHING;
        break;

    case S_LPAREN:
        if(t.type() == RPAREN) {
            state = S_WAITFORENDFUN;
            if(_funArity.find(name) != _funArity.end())
                throw LexicalError("Duplicate function name", name, _lineNumber);
            else
                _funArity[name] = arity;
        }
        else {
            if(t.type() == IDENTIFIER) {
                if(!IS_GLOBALVAR(t.lexeme()))
                    state = S_ARGUMENT;
                else
                    throw LexicalError((std::string("Invalid argument name '") + t.lexeme()) + "'", name, _lineNumber);
            }
            else
                state = S_NOTHING;
        }
        break;
        
    case S_ARGUMENT:
        arity++;
        if(t.type() == RPAREN) {
            state = S_WAITFORENDFUN;
            if(_funArity.find(name) != _funArity.end())
                throw LexicalError("Duplicate function name", name, _lineNumber);
            else
                _funArity[name] = arity;
        }
        else
            state = (t.type() == COMMA) ? S_COMMA : S_NOTHING;
        break;

    case S_COMMA:
        if(t.type() == IDENTIFIER) {
            if(!IS_GLOBALVAR(t.lexeme()))
                state = S_ARGUMENT;
            else
                throw LexicalError((std::string("Invalid argument name '") + t.lexeme()) + "'", name, _lineNumber);
        }
        else
            state = S_NOTHING;
        break;

    case S_WAITFORENDFUN:
        if(t.type() == ENDFUN)
            state = S_NOTHING;
        else if(t.type() == IDENTIFIER && IS_GLOBALVAR(t.lexeme()))
            _globals.insert(strtolower(t.lexeme()));
        break;
    }
}

} // namespace ccc
