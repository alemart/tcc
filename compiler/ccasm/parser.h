//
// Chinchilla Assembler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _ASMPARSER_H
#define _ASMPARSER_H

#include <list>
#include <string>
#include <map>
#include "error.h"
#include "lexer.h"

namespace ccasm
{

class Instruction;
typedef std::list<Instruction> InstructionList;
typedef std::map<std::string,int> LabelMap;

// parser
class Parser
{
public:
    Parser() : _lexer(NULL), _lineNumber(0) { }
    ~Parser() { }

    std::string parse(Lexer* lexer, bool debug = false) throw(ParseError);

private:
    Lexer* _lexer;
    LabelMap _label;
    InstructionList _instructionList;
    int _lineNumber;
    std::map<int,int> _realLine;

    // utilities
    int _getRealLine(int virtualLine) const;
    void _setRealLine(int virtualLine, int realLine);
    void _discoverLabels() throw(ParseError);
    void _discardUselessNewlines();
    std::string _registerId(const std::string& registerName) const throw(ParseError);

    // parsing utilities
    Token _currentToken;
    Token _nextToken();
    bool _accept(TokenType t);
    void _expect(TokenType t) throw(ParseError);

    // grammar
    void _program() throw(ParseError);
    void _line() throw(ParseError);

    // instruction builders
    Instruction buildSimpleInstruction(const std::string& instruction, int opcode); // instruction = opcode
    Instruction buildRegisterValueInstruction(const std::string& instruction, int opcode_if_register, int opcode_if_constant); // instruction = opcode register, (register | constant)
    Instruction buildJumpInstruction(const std::string& instruction, int opcode_if_register, int opcode_if_label); // instruction = opcode (label | register)
    Instruction buildRegisterInstruction(const std::string& instruction, int opcode); // instruction = opcode register
    Instruction buildValueInstruction(const std::string& instruction, int opcode_if_register, int opcode_if_constant); // instruction = opcode (register | constant)
};

// "byte-code" instruction
class Instruction
{
public:
    Instruction(int opcode, const std::string& op1 = "0", const std::string& op2 = "0") : _opcode(opcode), _op1(op1), _op2(op2) { }
    ~Instruction() { }

    const std::string toString() {
        std::stringstream ss;
        ss << _opcode << "," << _op1 << "," << _op2 << ",";
        return ss.str();
    }

private:
    int _opcode;
    std::string _op1, _op2;
};

} // namespace ccasm

#endif
