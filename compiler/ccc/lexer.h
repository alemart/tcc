//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _LEXER_H
#define _LEXER_H

#include <string>
#include <deque>
#include <map>
#include <set>
#include "token.h"
#include "error.h"

namespace ccc
{

// lexical analyzer
class Lexer
{
public:
    Lexer(int initialLineNum = 1);
    ~Lexer();

    int initialLineNumber() const;
    void feedLine(const std::string& line) throw(LexicalError);
    Token getToken(); // get next token
    void ungetToken(Token t); // unget token
    int functionArity(const std::string& funName) const; // -1 if funName does not exist
    const std::set<std::string>& functions() const;
    const std::set<std::string>& globalVariables() const;

private:
    std::deque<Token> _tokens;
    std::map<std::string,Token> _words;
    int _lineNumber, _initialLineNumber;
    std::map<std::string, int> _funArity;
    std::set<std::string> _globals;

    Token _scan(const std::string& line, int len, int& i) throw(LexicalError);
    inline void _reserve(TokenType type, const std::string& lexeme);
    inline void _scanDeclarations(const Token& t);
};

} // namespace ccc

#endif
