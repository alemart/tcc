//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _TOKEN_H
#define _TOKEN_H

#include <string>

namespace ccc
{

// token types
enum TokenType {
    NUMBER,
    BOOLEAN,
    STRING,

    COMMA,
    DOT,
    NEWLINE,
    IDENTIFIER,
    LPAREN,
    RPAREN,
    LSQBRACKET,
    RSQBRACKET,
    LCURLYBRACE,
    RCURLYBRACE,

    UNARYOP,
    BINARYOP,
    ASSIGNOP,

    FUN,
    ENDFUN,
    RETURN,

    IF,
    THEN,
    ELSEIF,
    ELSE,
    ENDIF,

    WHILE,
    WEND,

    DO,
    LOOP,

    FOR,
    TO,
    STEP,
    IN,
    NEXT,
    BREAK,

    ADDROF,
    ASM,
    PEEK,
    POKE,
    ENDOFFILE,
    UNKNOWN
};

// token class
class Token
{
public:
    Token(TokenType ty = UNKNOWN, const std::string& lx = "") : _type(ty), _lexeme(lx) { }
    ~Token() { }

    TokenType type() const { return _type; }
    std::string typeName() const { return typeToString(_type); }
    const std::string& lexeme() const { return _lexeme; }
    Token& operator=(const Token& tok) { _type = tok._type; _lexeme = tok._lexeme; return *this; }

    static std::string typeToString(TokenType tt) {
        switch(tt) {
        case NUMBER: return "number";
        case BOOLEAN: return "boolean";
        case STRING: return "string";
        case COMMA: return ",";
        case DOT: return ".";
        case NEWLINE: return "line break";
        case IDENTIFIER: return "identifier";
        case LPAREN: return "(";
        case RPAREN: return ")";
        case LSQBRACKET: return "[";
        case RSQBRACKET: return "]";
        case LCURLYBRACE: return "{";
        case RCURLYBRACE: return "}";
        case UNARYOP: return "unary operator";
        case BINARYOP: return "binary operator";
        case ASSIGNOP: return "assignment operator";
        case FUN: return "fun";
        case ENDFUN: return "endfun";
        case RETURN: return "return";
        case IF: return "if";
        case THEN: return "then";
        case ELSEIF: return "elseif";
        case ELSE: return "else";
        case ENDIF: return  "endif";
        case WHILE: return "while";
        case WEND: return "wend";
        case DO: return "do";
        case LOOP: return "loop";
        case FOR: return "for";
        case TO: return "to";
        case STEP: return "step";
        case IN: return "in";
        case NEXT: return "next";
        case BREAK: return "break";
        case ADDROF: return "__addrof";
        case ASM: return "__asm";
        case PEEK: return "__peek";
        case POKE: return "__poke";
        case ENDOFFILE: return "[end of file]";
        case UNKNOWN: return "[unknown token]";
        }

        return "???";
    };

private:
    TokenType _type;
    std::string _lexeme;
};

} // namespace ccc

#endif
