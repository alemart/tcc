//
// Chinchilla Assembler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
//

#include <sstream>
#include <stack>
#include <cctype>
#include "parser.h"
#include "lexer.h"

namespace ccasm
{

#define IS_REGISTER(token)  ((token).type() == REGISTER)
#define IS_IDENTIFIER(token)  ((token).type() == IDENTIFIER)
#define IS_CONSTANT(token)  (((token).type() == NUMBER) || ((token).type() == STRING) || ((token).type() == BOOLEAN))

// -------------------------------------

// convert to upper case
static std::string strtoupper(const std::string& s)
{
    std::string x;

    for(int i=0; i<(int)s.length(); i++)
        x += toupper(s[i]);

    return x;
}

// token type to string
static std::string tt2str(TokenType t)
{
    switch(t) {
        case INSTRUCTION:   return "INSTRUCTION";
        case REGISTER:      return "REGISTER";
        case COMMA:         return "COMMA";
        case NEWLINE:       return "NEWLINE";
        case LABEL:         return "LABEL";
        case IDENTIFIER:    return "IDENTIFIER";
        case NUMBER:        return "NUMBER";
        case BOOLEAN:       return "BOOLEAN";
        case STRING:        return "STRING";
        case ENDOFFILE:     return "ENDOFFILE";
        default:            return "UNKNOWN";
    }
}

// int to string
static std::string int2str(int i)
{
    std::stringstream ss;
    ss << i;
    return ss.str();
}

// -------------------------------------

// -------------------------------------

// given a line in the virtual file, returns the same line in the corresponding real file
int Parser::_getRealLine(int virtualLine) const
{
    std::map<int,int>::const_iterator it = _realLine.find(virtualLine);

    if(it != _realLine.end())
        return it->second;
    else
        return 0;
}

void Parser::_setRealLine(int virtualLine, int realLine)
{
    _realLine[virtualLine] = realLine;
}

// discard useless newlines
void Parser::_discardUselessNewlines()
{
    int realLine = 1, virtualLine = 0;
    std::stack<Token> s;
    Token t;

    // skip initial newlines
    t = _lexer->getToken();
    while(t.type() == NEWLINE) {
        realLine++;
        t = _lexer->getToken();
    }
    _lexer->ungetToken(t);

    // s/\n(\n)+/\n/
    while(t.type() != ENDOFFILE) {
        s.push(t = _lexer->getToken());
        if(t.type() == NEWLINE) {
            _setRealLine(virtualLine++, realLine++);

            // skip useless newlines
            do {
                if((t = _lexer->getToken()).type() == NEWLINE)
                    realLine++;
            } while(t.type() == NEWLINE);
            _lexer->ungetToken(t);
        }
        else if(t.type() == LABEL) {
            Token lbl = t;

            // skip the newline(s) after the label
            t = _lexer->getToken();
            while(t.type() == NEWLINE) {
                realLine++;
                t = _lexer->getToken();
            }
            _lexer->ungetToken(t);

            t = lbl;
        }
    }

    while(!s.empty()) {
        _lexer->ungetToken(s.top());
        s.pop();
    }
}

// find out the line numbers of the labels
void Parser::_discoverLabels() throw(ParseError)
{
    std::stack<Token> s;
    Token t;
    int line = 0;

    while(t.type() != ENDOFFILE) {
        s.push(t = _lexer->getToken());

        if(t.type() == LABEL) {
            std::string name = t.lexeme().substr(0, t.lexeme().length()-1);
            if(_label.find(name) == _label.end())
                _label[name] = line;
            else
                throw ParseError((std::string("Repeated label \"") + name) + std::string("\""), _getRealLine(line));
        }
        else if(t.type() == NEWLINE)
            line++;
    }

    while(!s.empty()) {
        t = s.top();

        // forget labels
        if(t.type() != LABEL)
            _lexer->ungetToken(t);

        s.pop();
    }
}

// start the parsing
std::string Parser::parse(Lexer *lexer, bool debug) throw(ParseError)
{
    std::string output;
    LabelMap::iterator it;
    InstructionList::iterator iti;

    // setup
    _lexer = lexer;
    _label.clear();
    _instructionList.clear();
    _lineNumber = 0;

    // discard useless newlines
    _discardUselessNewlines();
    
    // discover labels
    _discoverLabels();

    // generating the output
    if(debug) {
        // show debug info
        Token t;
        int n = 0;

        output += "-----------------------\n";
        output += "Label Address\n";
        output += "-----------------------\n";
        for(it=_label.begin(); it!=_label.end(); ++it)
            output += ((it->first + ": ") + int2str(it->second)) + "\n";

        output += "\n";
        output += "-----------------------\n";
        output += "Program\n";
        output += "-----------------------\n";

        output += "0\t";
        t = lexer->getToken();
        while(t.type() != ENDOFFILE) {
            output += std::string(" ") + t.lexeme() + ((t.type() == NEWLINE) ? int2str(++n) + "\t" : "");
            t = lexer->getToken();
        }
        output += "\n";

        // success!
        return output;
    }
    else {
        // parsing...
        _program();
        for(iti=_instructionList.begin(); iti!=_instructionList.end(); ++iti)
            output += iti->toString();

        // success!
        return (std::string("[") + output.substr(0, output.length()-1)) + std::string("]");
    }
}

// get the register number given its name
std::string Parser::_registerId(const std::string& registerName) const throw(ParseError)
{
    std::string r = strtoupper(registerName);

    if(r == "PC")
        return "0";
    else if(r == "SP")
        return "1";
    else if(r == "BP")
        return "2";
    else if(r == "CPF")
        return "3";
    else if(r == "ADR")
        return "4";
    else if(r == "FUN")
        return "5";
    else if(r == "A")
        return "6";
    else if(r == "B")
        return "7";
    else if(r == "C")
        return "8";
    else if(r == "D")
        return "9";
    else
        throw ParseError("Unknown register: " + registerName, _getRealLine(_lineNumber));

    // should not happen
    return "-1";
}

// parsing utilities: accept symbol
bool Parser::_accept(TokenType t)
{
    if(_currentToken.type() == t) {
        _nextToken();
        return true;
    }
    else
        return false;
}

// parsing utilities: expect symbol
void Parser::_expect(TokenType t) throw(ParseError)
{
    if(!_accept(t))
        throw ParseError("Unexpected symbol (expected a " + tt2str(t) + ", but got a " + tt2str(_currentToken.type()) + ": \"" + _currentToken.lexeme() + "\")", _getRealLine(_lineNumber));
}

// parsing utilities: next token
Token Parser::_nextToken()
{
    return _currentToken = _lexer->getToken();
}

// grammar: program
void Parser::_program() throw(ParseError)
{
    _nextToken();
    while(_currentToken.type() != ENDOFFILE)
        _line();
}

// grammar: line
void Parser::_line() throw(ParseError)
{
    std::string instruction, op1, op2;

    // get instruction
    instruction = strtoupper(_currentToken.lexeme());
    _expect(INSTRUCTION);

    // which instruction?
    if(instruction == "NOP") {
        _instructionList.push_back(buildSimpleInstruction(instruction, 0));
    }
    else if(instruction == "HALT") {
        _instructionList.push_back(buildSimpleInstruction(instruction, 1));
    }
    else if(instruction == "MOV") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 3, 2));
    }
    else if(instruction == "LOAD") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 5, 4));
    }
    else if(instruction == "STORE") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 7, 6));
    }
    else if(instruction == "SCMP") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 15, 14));
    }
    else if(instruction == "FCMP") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 13, 12));
    }
    else if(instruction == "LCMP") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 11, 10));
    }
    else if(instruction == "JMP") {
        _instructionList.push_back(buildJumpInstruction(instruction, 9, 8));
    }
    else if(instruction == "JE") {
        _instructionList.push_back(buildJumpInstruction(instruction, 22, 16));
    }
    else if(instruction == "JNE") {
        _instructionList.push_back(buildJumpInstruction(instruction, 23, 17));
    }
    else if(instruction == "JG") {
        _instructionList.push_back(buildJumpInstruction(instruction, 26, 20));
    }
    else if(instruction == "JGE") {
        _instructionList.push_back(buildJumpInstruction(instruction, 27, 21));
    }
    else if(instruction == "JL") {
        _instructionList.push_back(buildJumpInstruction(instruction, 24, 18));
    }
    else if(instruction == "JLE") {
        _instructionList.push_back(buildJumpInstruction(instruction, 25, 19));
    }
    else if(instruction == "PUSH") {
        _instructionList.push_back(buildValueInstruction(instruction, 29, 28));
    }
    else if(instruction == "POP") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 30));
    }
    else if(instruction == "CALL") {
        _instructionList.push_back(buildJumpInstruction(instruction, 32, 31));
    }
    else if(instruction == "RET") {
        _instructionList.push_back(buildSimpleInstruction(instruction, 33));
    }
    else if(instruction == "INT") {
        _instructionList.push_back(buildValueInstruction(instruction, 35, 34));
    }
    else if(instruction == "OR") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 37, 36));
    }
    else if(instruction == "AND") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 39, 38));
    }
    else if(instruction == "XOR") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 41, 40));
    }
    else if(instruction == "NOT") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 42));
    }
    else if(instruction == "ADD") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 44, 43));
    }
    else if(instruction == "SUB") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 46, 45));
    }
    else if(instruction == "MUL") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 48, 47));
    }
    else if(instruction == "DIV") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 50, 49));
    }
    else if(instruction == "MOD") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 52, 51));
    }
    else if(instruction == "NEG") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 53));
    }
    else if(instruction == "ACOS") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 55));
    }
    else if(instruction == "ASIN") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 56));
    }
    else if(instruction == "ATAN") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 57));
    }
    else if(instruction == "CEIL") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 58));
    }
    else if(instruction == "COS") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 59));
    }
    else if(instruction == "EXP") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 60));
    }
    else if(instruction == "FLOOR") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 61));
    }
    else if(instruction == "RND") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 62));
    }
    else if(instruction == "LOG") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 63));
    }
    else if(instruction == "SIN") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 64));
    }
    else if(instruction == "SQRT") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 65));
    }
    else if(instruction == "TAN") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 66));
    }
    else if(instruction == "LEN") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 67));
    }
    else if(instruction == "LEFT") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 69, 68));
    }
    else if(instruction == "RIGHT") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 71, 70));
    }
    else if(instruction == "CAT") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 73, 72));
    }
    else if(instruction == "UPR") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 74));
    }
    else if(instruction == "LWR") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 75));
    }
    else if(instruction == "STR") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 76));
    }
    else if(instruction == "VAL") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 77));
    }
    else if(instruction == "POW") {
        _instructionList.push_back(buildRegisterValueInstruction(instruction, 79, 78));
    }
    else if(instruction == "TYPE") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 80));
    }
    else if(instruction == "ASC") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 81));
    }
    else if(instruction == "CHR") {
        _instructionList.push_back(buildRegisterInstruction(instruction, 82));
    }
    else
        throw ParseError(std::string("Unknown instruction: ") + instruction, _getRealLine(_lineNumber));

    // success!
    _expect(NEWLINE);
    ++_lineNumber;
}

// instruction builders
Instruction Parser::buildSimpleInstruction(const std::string& instruction, int opcode)
{
    return Instruction(opcode);
}

Instruction Parser::buildRegisterInstruction(const std::string& instruction, int opcode)
{
    std::string op1 = _currentToken.lexeme();
    _expect(REGISTER);
    return Instruction(opcode, _registerId(op1));
}

Instruction Parser::buildRegisterValueInstruction(const std::string& instruction, int opcode_if_register, int opcode_if_constant)
{
    std::string op1, op2;

    op1 = _currentToken.lexeme();
    _expect(REGISTER);
    op1 = _registerId(op1);
    _expect(COMMA);

    if(IS_REGISTER(_currentToken)) {
        op2 = _registerId(_currentToken.lexeme());
        _nextToken();
        return Instruction(opcode_if_register, op1, op2);
    }
    else if(IS_CONSTANT(_currentToken)) {
        op2 = _currentToken.lexeme();
        _nextToken();
        return Instruction(opcode_if_constant, op1, op2);
    }
    else
        throw ParseError("Invalid syntax for " + instruction, _getRealLine(_lineNumber));

    return Instruction(opcode_if_constant);
}

Instruction Parser::buildJumpInstruction(const std::string& instruction, int opcode_if_register, int opcode_if_label)
{
    std::string op1 = _currentToken.lexeme();

    if(IS_REGISTER(_currentToken) && _label.find(op1) == _label.end()) {
        op1 = _registerId(op1);
        _nextToken();
        return Instruction(opcode_if_register, op1);
    }
    else if(IS_IDENTIFIER(_currentToken)) {
        if(_label.find(op1) != _label.end()) {
            std::stringstream ss;
            ss << _label[op1];
            op1 = ss.str();
            _nextToken();
            return Instruction(opcode_if_label, op1);
        }
        else
            throw ParseError("Undeclared label: " + op1, _getRealLine(_lineNumber));
    }
    else
        throw ParseError("Invalid syntax for " + instruction, _getRealLine(_lineNumber));

    return Instruction(opcode_if_label);
}

Instruction Parser::buildValueInstruction(const std::string& instruction, int opcode_if_register, int opcode_if_constant)
{
    std::string op1 = _currentToken.lexeme();

    if(IS_REGISTER(_currentToken)) {
        _nextToken();
        return Instruction(opcode_if_register, _registerId(op1));
    }
    else if(IS_CONSTANT(_currentToken)) {
        _nextToken();
        return Instruction(opcode_if_constant, op1);
    }
    else
        throw ParseError("Invalid syntax for " + instruction, _getRealLine(_lineNumber));

    return Instruction(opcode_if_constant);
}

} // namespace ccasm
