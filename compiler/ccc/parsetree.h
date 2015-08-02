//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

// http://en.wikipedia.org/wiki/Interpreter_pattern

#ifndef _PARSETREE_H
#define _PARSETREE_H

#include <string>
#include <list>
#include "error.h"

namespace ccc
{

// forward declarations
class EnvironmentVariable;
class EnvironmentFunction;

// <<abstract>>
// ParseTree
class ParseTree
{
public:
    ParseTree();
    virtual ~ParseTree() = 0;
    virtual std::list<std::string>& assemblyCode();
    virtual void performSimpleCodeOptimization();

protected:
    std::list<std::string> _code; // where we store the assembly code
    virtual std::string _newlabel() const;
};

// <<abstract>>
// Statement
class Stmt : public ParseTree
{
public:
    Stmt();
    virtual ~Stmt() = 0;
};

// <<abstract>>
// Expression
class Expr : public ParseTree
{
public:
    Expr();
    virtual ~Expr() = 0;
};

// <<abstract>>
// LoopStmt
class LoopStmt : public ParseTree
{
public:
    LoopStmt();
    virtual ~LoopStmt() = 0;

protected:
    std::string _labelBegin, _labelEnd;
};

// Empty tree: emits no code at all
class EmptyTree : public ParseTree
{
public:
    EmptyTree();
    virtual ~EmptyTree();
};

// Statement List
class Stmts : public ParseTree
{
public:
    Stmts(ParseTree* stmt, ParseTree* next); // next may be an EmptyTree, but must NOT be NULL
    virtual ~Stmts();

private:
    ParseTree* _stmt;
    ParseTree* _next;
};

// Assignment
class Assign : public Stmt
{
public:
    Assign(const std::string& op, const EnvironmentVariable* var, ParseTree* expr);
    virtual ~Assign();

private:
    ParseTree* _expr;
};

// If
class If : public Stmt
{
public:
    If(ParseTree* conditionExpr, ParseTree* yes, ParseTree* no);
    If(ParseTree* conditionExpr, ParseTree* yes);
    virtual ~If();

private:
    ParseTree* _conditionExpr;
    ParseTree* _yes;
    ParseTree* _no;
};

// Do
class Do : public LoopStmt
{
public:
    Do(ParseTree* block);
    virtual ~Do();

private:
    ParseTree* _block;
};

// While
class While : public LoopStmt
{
public:
    While(ParseTree* conditionExpr, ParseTree* block);
    virtual ~While();

private:
    ParseTree* _conditionExpr;
    ParseTree* _block;
};

// For
class For : public LoopStmt
{
public:
    For(const EnvironmentVariable* index, ParseTree* initialValueExpr, ParseTree* finalValueExpr, ParseTree* stepValueExpr, ParseTree* block);
    For(const EnvironmentVariable* index, ParseTree* initialValueExpr, ParseTree* finalValueExpr, ParseTree* block);
    virtual ~For();

private:
    ParseTree* _initialValueExpr;
    ParseTree* _finalValueExpr;
    ParseTree* _stepValueExpr;
    ParseTree* _block;
};


// ForEach
class ForEach : public LoopStmt
{
public:
    ForEach(const EnvironmentVariable* index, const EnvironmentVariable* collection, ParseTree* block);
    virtual  ~ForEach();

private:
    ParseTree* _block;
};

// Break
class Break : public Stmt
{
public:
    Break();
    virtual ~Break();
};

// Function
class Fun : public Stmt
{
public:
    Fun(const EnvironmentFunction* fun, int numberOfLocalVariables, ParseTree* block);
    virtual ~Fun();

private:
    ParseTree* _block;
};

// Return
class Return : public Stmt
{
public:
    Return();
    Return(ParseTree* expr);
    virtual ~Return();

private:
    ParseTree* _expr;
};

// Procedure Call (a function call that doesn't return a value)
class ProcedureCall : public Stmt
{
public:
    ProcedureCall(const EnvironmentFunction* fun, const std::list<ParseTree*>& paramList);
    virtual ~ProcedureCall();

private:
    std::list<ParseTree*> _paramList;
};

// Function Call (this returns a value)
class FunctionCall : public Expr
{
public:
    FunctionCall(const EnvironmentFunction* fun, const std::list<ParseTree*>& paramList);
    virtual ~FunctionCall();

private:
    std::list<ParseTree*> _paramList;
};

// Binary Operation
class BinaryOp : public Expr
{
public:
    BinaryOp(const std::string& op, ParseTree* leftExpr, ParseTree* rightExpr);
    virtual ~BinaryOp();

private:
    ParseTree *_left, *_right;
};

// Unary operation
class UnaryOp : public Expr
{
public:
    UnaryOp(const std::string& op, ParseTree* expr);
    virtual ~UnaryOp();

private:
    ParseTree* _expr;
};

// Get Table Entry (get its value as an expression)
class GetTableEntry : public Expr
{
public:
    GetTableEntry(const EnvironmentVariable* table, ParseTree* key);
    virtual ~GetTableEntry();

private:
    ParseTree *_key;
};

// Set Table Entry
class SetTableEntry : public Stmt
{
public:
    SetTableEntry(const std::string& assignOperator, const EnvironmentVariable* table, ParseTree* key, ParseTree* value);
    virtual ~SetTableEntry();

private:
    ParseTree *_key, *_value;
};

// Peek - get a value from a memory address (get its value as an expression)
class Peek : public Expr
{
public:
    Peek(ParseTree* address);
    virtual ~Peek();

private:
    ParseTree *_address;
};

// Poke - put a value at a memory address
class Poke : public Stmt
{
public:
    Poke(ParseTree* address, ParseTree* value);
    virtual ~Poke();

private:
    ParseTree *_address, *_value;
};

// Variable (returns its value as an expression)
class Variable : public Expr
{
public:
    Variable(const EnvironmentVariable* var);
    virtual ~Variable();
};

// Address of a Variable (returns its value as an expression)
class AddressOfVariable : public Expr
{
public:
    AddressOfVariable(const EnvironmentVariable* var);
    virtual ~AddressOfVariable();
};

// Number
class Number : public Expr
{
public:
    Number(const std::string& num);
    virtual ~Number();
};

// Boolean
class Boolean : public Expr
{
public:
    Boolean(const std::string& bol);
    virtual ~Boolean();
};

// String
class String : public Expr
{
public:
    String(const std::string& str);
    virtual ~String();
};

// Assembly
class Assembly : public Expr
{
public:
    Assembly(const std::string& str);
    virtual ~Assembly();
};

} // namespace ccc

#endif
