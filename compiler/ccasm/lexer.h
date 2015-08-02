//
// Chinchilla Assembler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _ASMLEXER_H
#define _ASMLEXER_H

#include <string>
#include <deque>
#include <set>
#include "error.h"

namespace ccasm
{

// token types
enum TokenType { INSTRUCTION, REGISTER, COMMA, NEWLINE, LABEL, IDENTIFIER, NUMBER, BOOLEAN, STRING, ENDOFFILE, UNKNOWN };

// token class
class Token
{
public:
    Token(TokenType ty = UNKNOWN, std::string lx = "") : _type(ty), _lexeme(lx) { }
    ~Token() { }

    TokenType type() const { return _type; }
    std::string lexeme() const { return _lexeme; }

    Token operator=(const Token& tok) { _type = tok._type; _lexeme = tok._lexeme; return *this; }

private:
    TokenType _type;
    std::string _lexeme;
};

// lexical analyzer
class Lexer
{
public:
    Lexer();
    ~Lexer();

    void feedLine(const std::string& line) throw(LexicalError);
    Token getToken(); // get next token
    void ungetToken(Token t); // unget token

private:
    std::deque<Token> _tokens;
    std::set<std::string> _registers, _instructions;
    int _lineNumber;

    void _addToken(const std::string& lexeme);
    TokenType _classify(const std::string& lexeme);
};

} // namespace ccasm

#endif
