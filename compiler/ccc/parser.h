//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _PARSER_H
#define _PARSER_H

#include <string>
#include "token.h"
#include "error.h"

/*
--------------------------------
my grammar:
--------------------------------

program ->      stmts

params ->       'IDENTIFIER' (',' 'IDENTIFIER')*
                |
                *empty*

exprs ->        expr (',' expr)*
                |
                *empty*

stmts ->        ('\n')* stmt stmts
                |
                ('\n')* 'ENDOFFILE'

stmt ->         expr '\n' // *** only if it's a function call
                |
                '__asm' 'STRING' '\n'
                |
                '__poke' expr ',' expr '\n'
                |
                'fun' 'IDENTIFIER' '(' params ')' '\n' stmts 'endfun' '\n' // *** OUTSIDE FUNCTIONS AND LOOPS ONLY
                |
                'return' expr '\n' // *** INSIDE FUNCTIONS ONLY
                |
                'break' '\n' // *** INSIDE LOOPS ONLY
                |
                'IDENTIFIERfunname' exprs '\n' // procedure call
                |
                'IDENTIFIER' '=assign' expr '\n'
                |
                'IDENTIFIER' '+=' expr '\n'
                |
                'IDENTIFIER' '-=' expr '\n'
                |
                'IDENTIFIER' '*=' expr '\n'
                |
                'IDENTIFIER' '/=' expr '\n'
                |
                'IDENTIFIER' '^=' expr '\n'
                |
                'IDENTIFIER' '[' expr ']' '=assign' expr '\n'
                |
                'IDENTIFIER' '[' expr ']' '+=' expr '\n'
                |
                'IDENTIFIER' '[' expr ']' '-=' expr '\n'
                |
                'IDENTIFIER' '[' expr ']' '*=' expr '\n'
                |
                'IDENTIFIER' '[' expr ']' '/=' expr '\n'
                |
                'IDENTIFIER' '[' expr ']' '^=' expr '\n'
                |
                'do' '\n' stmts 'loop' '\n'
                |
                'for' 'IDENTIFIER' '=assign' expr 'to' expr '\n' stmts 'next' '\n'
                |
                'for' 'IDENTIFIER' '=assign' expr 'to' expr 'step' expr '\n' stmts 'next' '\n'
                |
                'for' 'IDENTIFIER' 'in' 'IDENTIFIER' '\n'
                |
                'while' expr '\n' stmts 'wend' '\n'
                |
                'if' expr 'then' stmt
                |
                'if' expr 'then' '\n' stmts ifbranch
                

ifbranch ->     'endif' '\n'
                |
                'else' '\n' stmts 'endif' '\n'
                |
                'elseif' expr 'then' '\n' stmts ifbranch

expr ->         logicexpr

logicexpr ->    cmpexpr 'and' logicexpr
                |
                cmpexpr 'or' logicexpr
                |
                cmpexpr 'xor' logicexpr
                |
                cmpexpr

cmpexpr ->      ariexpr '=cmp' ariexpr
                |
                ariexpr '<>' ariexpr
                |
                ariexpr '<' ariexpr
                |
                ariexpr '>' ariexpr
                |
                ariexpr '<=' ariexpr
                |
                ariexpr '>=' ariexpr
                |
                ariexpr

ariexpr ->      termexpr '+' ariexpr
                |
                termexpr '-' ariexpr
                |
                termexpr

termexpr ->     unaryexpr '*' termexpr
                |
                unaryexpr '/' termexpr
                |
                unaryexpr 'mod' termexpr
                |
                unaryexpr

unaryexpr ->    '-unary' powerexpr
                |
                '+unary' powerexpr
                |
                powerexpr

powerexpr ->    factorexpr '^' factorexpr
                |
                factorexpr

factorexpr ->   '-unary' factorexpr
                |
                '+unary' factorexpr
                |
                'not' factorexpr
                |
                '(' expr ')'
                |
                'NUMBER'
                |
                'BOOLEAN'
                |
                'STRING'
                |
                'IDENTIFIER'
                |
                'IDENTIFIERfunname' '(' exprs ')' // *** function call
                |
                'IDENTIFIER' '[' expr ']' // get table entry
                |
                '__peek' '(' expr ')'
*/

namespace ccc
{

class Lexer;
class ParseTree;
class Environment;

// parser
class Parser
{
public:
    Parser() : _lexer(NULL), _lineNumber(1), _env(NULL), _inALoop(false), _inAFunction(false), _currentBlock(BT_NONE) { }
    ~Parser() { }

    ParseTree* parse(Lexer* lexer);

private:
    Lexer* _lexer;
    int _lineNumber;
    Environment* _env;
    bool _inALoop, _inAFunction; // are we inside a loop/fun?
    enum BlockType { BT_NONE, BT_FUN, BT_DO, BT_FOR, BT_WHILE, BT_IF } _currentBlock; // type of the block we're in

    // generic functions
    Token _sym, _nextSym;
    void _getsym();
    bool _accept(TokenType tt);
    bool _expect(TokenType tt) throw(ParseError);

    // environment manipulation
    Environment* _pushEnv();
    void _popEnv();

    // non-terminals
    ParseTree* _program();
    ParseTree* _stmts();
    ParseTree* _stmt();
    ParseTree* _expr();
    ParseTree* _logicexpr();
    ParseTree* _cmpexpr();
    ParseTree* _ariexpr();
    ParseTree* _termexpr();
    ParseTree* _unaryexpr();
    ParseTree* _powerexpr();
    ParseTree* _factorexpr();
};

} // namespace ccc

#endif
