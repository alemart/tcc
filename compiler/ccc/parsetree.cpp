//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#include <iostream>
#include <string>
#include <sstream>
#include "parsetree.h"
#include "environment.h"
#include "util.h"

// concat two lists
template<class T> static std::list<T>& concat(std::list<T>& dest, const std::list<T>& src)
{
    dest.insert(dest.end(), src.begin(), src.end());
    return dest;
}

namespace ccc
{

// ParseTree
ParseTree::ParseTree()
{
}

ParseTree::~ParseTree()
{
}

std::list<std::string>& ParseTree::assemblyCode()
{
    return _code;
}

std::string ParseTree::_newlabel() const
{
    std::stringstream ss;
    static int id = 0;
    ss << "L" << std::hex << (id++);
    return ss.str();
}

void ParseTree::performSimpleCodeOptimization()
{
    // eliminates dumb "push/pop" statements
    std::list<std::string> tmp;

    std::list<std::string>::const_iterator it = _code.begin();
    while(it != _code.end()) {
        std::string curr(*it);
        if(++it != _code.end()) {
            std::string next(*it);

            // push ... pop => mov
            if(curr.substr(0, 4) == "push" && next.substr(0, 3) == "pop") {
                std::string pushedValue(curr.substr(4)), poppedValue(next.substr(3));
                if(pushedValue != poppedValue)
                    tmp.push_back(std::string("mov") + poppedValue + std::string(",") + pushedValue);
                ++it;
            }


            // push ... push ... pop ... pop => push ... mov ... pop
            else if(curr.substr(0, 4) == "push" && next.substr(0, 4) == "push") {
                std::string next2;
                if(++it != _code.end() && "pop" == (next2 = *it).substr(0, 3)) {
                    std::string next3;
                    if(++it != _code.end() && "pop" == (next3 = *it).substr(0, 3)) {
                        std::string pushedValueA(curr.substr(4)), pushedValueB(next.substr(4));
                        std::string poppedValueB(next2.substr(3)), poppedValueA(next3.substr(3));
                        if(pushedValueA != poppedValueA)
                            tmp.push_back(curr);
                        if(pushedValueB != poppedValueB)
                            tmp.push_back(std::string("mov") + poppedValueB + std::string(",") + pushedValueB);
                        if(pushedValueA != poppedValueA)
                            tmp.push_back(next3);
                        ++it;
                    }
                    else {
                        tmp.push_back(curr);
                        std::string pushedValue(next.substr(4)), poppedValue(next2.substr(3));
                        if(pushedValue != poppedValue)
                            tmp.push_back(std::string("mov") + poppedValue + std::string(",") + pushedValue);
                    }
                }
                else {
                    tmp.push_back(curr);
                    tmp.push_back(next);
                }
            }


            // or else :)
            else
                tmp.push_back(curr);
        }
        else
            tmp.push_back(curr);
    }

    _code = tmp;
}


// Stmt
Stmt::Stmt()
{
}

Stmt::~Stmt()
{
}

// Expr
Expr::Expr()
{
}

Expr::~Expr()
{
}

// LoopStmt
LoopStmt::LoopStmt() : _labelBegin(_newlabel()), _labelEnd(_newlabel())
{
}

LoopStmt::~LoopStmt()
{
}

// EmptyTree
EmptyTree::EmptyTree()
{
}

EmptyTree::~EmptyTree()
{
}

// Stmts
Stmts::Stmts(ParseTree* stmt, ParseTree* next) : _stmt(stmt), _next(next)
{
    _code.splice(_code.end(), _stmt->assemblyCode());
    _code.splice(_code.end(), _next->assemblyCode());
}

Stmts::~Stmts()
{
    delete _stmt;
    delete _next;
}

// Assign
Assign::Assign(const std::string& op, const EnvironmentVariable* var, ParseTree* expr) : _expr(expr)
{
    // put the new value of the variable on the top of the stack
    _code.splice(_code.end(), _expr->assemblyCode());

    // assignment
    if(op == "=") {
        _code.push_back("pop a");
        concat(_code, var->moveMyAddressToADR());
        _code.push_back("store a, adr");
    }
    else if(op == "+=") {
        _code.push_back("pop b");
        concat(_code, var->moveMyAddressToADR());
        _code.push_back("load a, adr");
        _code.push_back("add a, b");
        _code.push_back("store a, adr");
    }
    else if(op == "-=") {
        _code.push_back("pop b");
        concat(_code, var->moveMyAddressToADR());
        _code.push_back("load a, adr");
        _code.push_back("sub a, b");
        _code.push_back("store a, adr");
    }
    else if(op == "*=") {
        _code.push_back("pop b");
        concat(_code, var->moveMyAddressToADR());
        _code.push_back("load a, adr");
        _code.push_back("mul a, b");
        _code.push_back("store a, adr");
    }
    else if(op == "/=") {
        _code.push_back("pop b");
        concat(_code, var->moveMyAddressToADR());
        _code.push_back("load a, adr");
        _code.push_back("div a, b");
        _code.push_back("store a, adr");
    }
    else if(op == "^=") {
        _code.push_back("pop b");
        concat(_code, var->moveMyAddressToADR());
        _code.push_back("load a, adr");
        _code.push_back("pow a, b");
        _code.push_back("store a, adr");
    }
    else
        throw RuntimeError(std::string("Invalid assignment tree for op ") + op);
}

Assign::~Assign()
{
    delete _expr;
}

// If
If::If(ParseTree* conditionExpr, ParseTree* yes, ParseTree* no) : _conditionExpr(conditionExpr), _yes(yes), _no(no)
{
    std::string labelEnd(_newlabel());
    std::string labelElse(_newlabel());

    _code.splice(_code.end(), _conditionExpr->assemblyCode());
    _code.push_back("pop a");
    _code.push_back("lcmp a, false");
    _code.push_back(std::string("je ") + labelElse);
    _code.splice(_code.end(), _yes->assemblyCode());
    _code.push_back(std::string("jmp ") + labelEnd);
    _code.push_back(labelElse + ":");
    _code.splice(_code.end(), _no->assemblyCode());
    _code.push_back(labelEnd + ":");
}

If::If(ParseTree* conditionExpr, ParseTree* yes) : _conditionExpr(conditionExpr), _yes(yes), _no(new EmptyTree())
{
    std::string labelEnd(_newlabel());

    _code.splice(_code.end(), _conditionExpr->assemblyCode());
    _code.push_back("pop a");
    _code.push_back("lcmp a, false");
    _code.push_back(std::string("je ") + labelEnd);
    _code.splice(_code.end(), _yes->assemblyCode());
    _code.push_back(labelEnd + ":");
}

If::~If()
{
    delete _conditionExpr;
    delete _yes;
    delete _no;
}

// Do
Do::Do(ParseTree* block) : _block(block)
{
    _code.push_back(_labelBegin + ":");

    for(std::list<std::string>::iterator it = _block->assemblyCode().begin(); it != _block->assemblyCode().end(); ++it)
        *it = strreplace("<loopend>", _labelEnd, *it); // delayed substitution
    _code.splice(_code.end(), _block->assemblyCode());

    _code.push_back(std::string("jmp ") + _labelBegin);
    _code.push_back(_labelEnd + ":");
}

Do::~Do()
{
    delete _block;
}

// While
While::While(ParseTree* conditionExpr, ParseTree* block) : _conditionExpr(conditionExpr), _block(block)
{
    _code.push_back(_labelBegin + ":");
    _code.splice(_code.end(), _conditionExpr->assemblyCode());
    _code.push_back("pop a");
    _code.push_back("lcmp a, false");
    _code.push_back(std::string("je ") + _labelEnd);

    for(std::list<std::string>::iterator it = _block->assemblyCode().begin(); it != _block->assemblyCode().end(); ++it)
        *it = strreplace("<loopend>", _labelEnd, *it); // delayed substitution
    _code.splice(_code.end(), _block->assemblyCode());

    _code.push_back(std::string("jmp ") + _labelBegin);
    _code.push_back(_labelEnd + ":");
}

While::~While()
{
    delete _conditionExpr;
    delete _block;
}

// For
For::For(const EnvironmentVariable* index, ParseTree* initialValueExpr, ParseTree* finalValueExpr, ParseTree* stepValueExpr, ParseTree* block) : _initialValueExpr(initialValueExpr), _finalValueExpr(finalValueExpr), _stepValueExpr(stepValueExpr), _block(block)
{
    std::string lbl1 = _newlabel();
    std::string lbl2 = _newlabel();

    // for var = ... to ... step ...
    _code.splice(_code.end(), _initialValueExpr->assemblyCode());
    _code.push_back("pop a");
    _code.push_back("val a");
    concat(_code, index->moveMyAddressToADR());
    _code.push_back("store a, adr");

    _code.push_back(_labelBegin + ":");
    _code.splice(_code.end(), _stepValueExpr->assemblyCode());
    _code.splice(_code.end(), _finalValueExpr->assemblyCode());
    _code.push_back("pop b"); // b: final value
    _code.push_back("val b");
    _code.push_back("pop c"); // c: step value
    _code.push_back("val c");
    _code.push_back("push c");
    concat(_code, index->moveMyAddressToADR());
    _code.push_back("load a, adr"); // a: index value

    _code.push_back("fcmp c, 0");
    _code.push_back("mov c, true");
    _code.push_back(std::string("jge ") + lbl1);
    _code.push_back("mov c, false"); // c: step value < 0
    _code.push_back("fcmp a, b");
    _code.push_back("mov b, true"); // b: index value >= final value
    _code.push_back(std::string("jge ") + lbl2);
    _code.push_back("mov b, false"); // b: index value < final value
    _code.push_back(std::string("jmp ") + lbl2);
    _code.push_back(lbl1 + ":"); // c: step value >= 0
    _code.push_back("fcmp a, b");
    _code.push_back("mov b, true"); // b: index value > final value
    _code.push_back(std::string("jg ") + lbl2);
    _code.push_back("mov b, false"); // b: index value <= final value
    _code.push_back(lbl2 + ":");
    _code.push_back("xor b, c"); // b: (step value >= 0 and index value <= final value) or (step value < 0 and index value >= final value)
    _code.push_back("lcmp b, true");
    _code.push_back(std::string("jne ") + _labelEnd);

    for(std::list<std::string>::iterator it = _block->assemblyCode().begin(); it != _block->assemblyCode().end(); ++it)
        *it = strreplace("<loopend>", _labelEnd, *it); // delayed substitution
    _code.splice(_code.end(), _block->assemblyCode());

    concat(_code, index->moveMyAddressToADR());
    _code.push_back("load a, adr"); // a: index value
    _code.push_back("pop c");
    _code.push_back("add a, c");
    _code.push_back("store a, adr");
    _code.push_back(std::string("jmp ") + _labelBegin);
    _code.push_back(_labelEnd + ":");
}

For::For(const EnvironmentVariable* index, ParseTree* initialValueExpr, ParseTree* finalValueExpr, ParseTree* block) : _initialValueExpr(initialValueExpr), _finalValueExpr(finalValueExpr), _stepValueExpr(new EmptyTree()), _block(block)
{
    // for var = ... to ...
    _code.splice(_code.end(), _initialValueExpr->assemblyCode());
    _code.push_back("pop a");
    _code.push_back("val a");
    concat(_code, index->moveMyAddressToADR());
    _code.push_back("store a, adr");

    _code.push_back(_labelBegin + ":");
    _code.splice(_code.end(), _finalValueExpr->assemblyCode());
    _code.push_back("pop b");
    _code.push_back("val b");
    concat(_code, index->moveMyAddressToADR());
    _code.push_back("load a, adr");
    _code.push_back("fcmp a, b");
    _code.push_back(std::string("jg ") + _labelEnd);

    for(std::list<std::string>::iterator it = _block->assemblyCode().begin(); it != _block->assemblyCode().end(); ++it)
        *it = strreplace("<loopend>", _labelEnd, *it); // delayed substitution
    _code.splice(_code.end(), _block->assemblyCode());

    concat(_code, index->moveMyAddressToADR());
    _code.push_back("load a, adr");
    _code.push_back("add a, 1");
    _code.push_back("store a, adr");
    _code.push_back(std::string("jmp ") + _labelBegin);
    _code.push_back(_labelEnd + ":");
}

For::~For()
{
    delete _block;
    delete _stepValueExpr;
    delete _finalValueExpr;
    delete _initialValueExpr;
}

// Break
Break::Break()
{
    _code.push_back("jmp <loopend>"); // <loopend> will be replaced by a valid label later
}

Break::~Break()
{
}

// Fun
Fun::Fun(const EnvironmentFunction* fun, int numberOfLocalVariables, ParseTree* block) : _block(block)
{
    std::stringstream ss;
    std::string lbl(_newlabel());
    std::string funEndLabel(_newlabel());
    ss << numberOfLocalVariables;

    _code.push_back(std::string("jmp ") + lbl);
    _code.push_back(fun->label() + ":");
    _code.push_back("push bp");
    _code.push_back("mov bp, sp");
    if(numberOfLocalVariables > 0)
        _code.push_back(std::string("sub sp, ") + ss.str()); // space for local variables

    for(std::list<std::string>::iterator it = _block->assemblyCode().begin(); it != _block->assemblyCode().end(); ++it)
        *it = strreplace("<funend>", funEndLabel, *it); // delayed substitution
    _code.splice(_code.end(), _block->assemblyCode());

    _code.push_back(funEndLabel + ":");
    if(numberOfLocalVariables > 0)
        _code.push_back(std::string("add sp, ") + ss.str());
    _code.push_back("pop bp");
    _code.push_back("ret");
    _code.push_back(lbl + ":");
}

Fun::~Fun()
{
    delete _block;
}

// Return
Return::Return() : _expr(new EmptyTree())
{
    _code.push_back("jmp <funend>");
}

Return::Return(ParseTree* expr) : _expr(expr)
{
    _code.splice(_code.end(), _expr->assemblyCode());
    _code.push_back("pop fun");
    _code.push_back("jmp <funend>");
}

Return::~Return()
{
    delete _expr;
}

// ProcedureCall
ProcedureCall::ProcedureCall(const EnvironmentFunction* fun, const std::list<ParseTree*>& paramList) : _paramList(paramList) 
{
    // push parameters in reverse order
    for(std::list<ParseTree*>::reverse_iterator it = _paramList.rbegin(); it != _paramList.rend(); ++it)
        _code.splice(_code.end(), (*it)->assemblyCode());

    // call function
    _code.push_back(std::string("call ") + fun->label());

    // pop parameters
    for(std::list<ParseTree*>::reverse_iterator it = _paramList.rbegin(); it != _paramList.rend(); ++it)
        _code.push_back("pop a");
}

ProcedureCall::~ProcedureCall()
{
    for(std::list<ParseTree*>::iterator it = _paramList.begin(); it != _paramList.end(); ++it)
        delete *it;
}

// FunctionCall
FunctionCall::FunctionCall(const EnvironmentFunction* fun, const std::list<ParseTree*>& paramList) : _paramList(paramList) 
{
    // push parameters in reverse order
    for(std::list<ParseTree*>::reverse_iterator it = _paramList.rbegin(); it != _paramList.rend(); ++it)
        _code.splice(_code.end(), (*it)->assemblyCode());

    // call function
    _code.push_back(std::string("call ") + fun->label());

    // pop parameters
    for(std::list<ParseTree*>::reverse_iterator it = _paramList.rbegin(); it != _paramList.rend(); ++it)
        _code.push_back("pop a");

    // return value
    _code.push_back("push fun");
}

FunctionCall::~FunctionCall()
{
    for(std::list<ParseTree*>::iterator it = _paramList.begin(); it != _paramList.end(); ++it)
        delete *it;
}

// BinaryOp
BinaryOp::BinaryOp(const std::string& op, ParseTree* leftExpr, ParseTree* rightExpr) : _left(leftExpr), _right(rightExpr)
{
    _code.splice(_code.end(), _left->assemblyCode());
    if(strtolower(op) == "and") {
        // short-circuit evaluation
        std::string label = _newlabel();
        _code.push_back("pop a");
        _code.push_back("lcmp a, false");
        _code.push_back("push a");
        _code.push_back(std::string("je ") + label);
        _code.push_back("pop a");
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back(label + ":");
    }
    else if(strtolower(op) == "or") {
        // short-circuit evaluation
        std::string label = _newlabel();
        _code.push_back("pop a");
        _code.push_back("lcmp a, false");
        _code.push_back("push a");
        _code.push_back(std::string("jne ") + label);
        _code.push_back("pop a");
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back(label + ":");
    }
    else if(strtolower(op) == "xor") {
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("xor a, b");
        _code.push_back("push a");
    }
    else if(op == "=") {
        std::string label = _newlabel();
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("scmp a, b"); // scmp works for all data types
        _code.push_back("mov a, true");
        _code.push_back(std::string("je ") + label);
        _code.push_back("mov a, false");
        _code.push_back(label + ":");
        _code.push_back("push a");
    }
    else if(op == "<>") {
        std::string label = _newlabel();
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("scmp a, b");
        _code.push_back("mov a, true");
        _code.push_back(std::string("jne ") + label);
        _code.push_back("mov a, false");
        _code.push_back(label + ":");
        _code.push_back("push a");
    }
    else if(op == "<") {
        std::string label = _newlabel();
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("scmp a, b");
        _code.push_back("mov a, true");
        _code.push_back(std::string("jl ") + label);
        _code.push_back("mov a, false");
        _code.push_back(label + ":");
        _code.push_back("push a");
    }
    else if(op == "<=") {
        std::string label = _newlabel();
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("scmp a, b");
        _code.push_back("mov a, true");
        _code.push_back(std::string("jle ") + label);
        _code.push_back("mov a, false");
        _code.push_back(label + ":");
        _code.push_back("push a");
    }
    else if(op == ">") {
        std::string label = _newlabel();
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("scmp a, b");
        _code.push_back("mov a, true");
        _code.push_back(std::string("jg ") + label);
        _code.push_back("mov a, false");
        _code.push_back(label + ":");
        _code.push_back("push a");
    }
    else if(op == ">=") {
        std::string label = _newlabel();
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("scmp a, b");
        _code.push_back("mov a, true");
        _code.push_back(std::string("jge ") + label);
        _code.push_back("mov a, false");
        _code.push_back(label + ":");
        _code.push_back("push a");
    }
    else if(op == "+") {
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("add a, b");
        _code.push_back("push a");
    }
    else if(op == "-") {
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("sub a, b");
        _code.push_back("push a");
    }
    else if(op == "*") {
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("mul a, b");
        _code.push_back("push a");
    }
    else if(op == "/") {
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("div a, b");
        _code.push_back("push a");
    }
    else if(strtolower(op) == "mod") {
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("mod a, b");
        _code.push_back("push a");
    }
    else if(op == "^") {
        _code.splice(_code.end(), _right->assemblyCode());
        _code.push_back("pop b");
        _code.push_back("pop a");
        _code.push_back("pow a, b");
        _code.push_back("push a");
    }
    else
        throw RuntimeError(std::string("Unknown binaryop tree for op ") + op);
}

BinaryOp::~BinaryOp()
{
    delete _right;
    delete _left;
}

// UnaryOp
UnaryOp::UnaryOp(const std::string& op, ParseTree* expr) : _expr(expr)
{
    _code.splice(_code.end(), _expr->assemblyCode());
    if(op == "+") {
        ;
    }
    else if(op == "-") {
        _code.push_back("pop a");
        _code.push_back("neg a");
        _code.push_back("push a");
    }
    else if(strtolower(op) == "not") {
        _code.push_back("pop a");
        _code.push_back("not a");
        _code.push_back("push a");
    }
    else
        throw RuntimeError(std::string("Unknown unaryop tree for op ") + op);
}

UnaryOp::~UnaryOp()
{
    delete _expr;
}

// Peek
Peek::Peek(ParseTree* address) : _address(address)
{
    _code.splice(_code.end(), _address->assemblyCode());
    _code.push_back("pop adr");
    _code.push_back("load a, adr");
    _code.push_back("push a");
}

Peek::~Peek()
{
    delete _address;
}

// Poke
Poke::Poke(ParseTree* address, ParseTree* value) : _address(address), _value(value)
{
    _code.splice(_code.end(), _value->assemblyCode());
    _code.splice(_code.end(), _address->assemblyCode());
    _code.push_back("pop adr");
    _code.push_back("pop a");
    _code.push_back("store a, adr");
}

Poke::~Poke()
{
    delete _address;
    delete _value;
}

// Get Table Entry
GetTableEntry::GetTableEntry(const EnvironmentVariable* table, ParseTree* key) : _key(key)
{
    _code.splice(_code.end(), _key->assemblyCode());
    concat(_code, table->moveMyAddressToADR());
    _code.push_back("load a, adr");
    _code.push_back("push a");
    _code.push_back("call _gettableentry");
    _code.push_back("pop a");
    _code.push_back("pop a");
    _code.push_back("push fun");
}

GetTableEntry::~GetTableEntry()
{
    delete _key;
}

// Set Table Entry
SetTableEntry::SetTableEntry(const std::string& assignOperator, const EnvironmentVariable* table, ParseTree* key, ParseTree* value) : _key(key), _value(value)
{
    std::map<std::string,std::string> asmop;
    asmop["+="] = "add";
    asmop["-="] = "sub";
    asmop["*="] = "mul";
    asmop["/="] = "div";
    asmop["^="] = "pow";

    // push the 'value' to the stack
    _code.splice(_code.end(), _value->assemblyCode());

    // push the 'key' to the stack
    _code.splice(_code.end(), _key->assemblyCode());

    // push the table to the stack
    concat(_code, table->moveMyAddressToADR());
    _code.push_back("load a, adr");
    _code.push_back("push a");

    // assignment
    if(assignOperator == "=") {
        ;
    }
    else if(asmop.count(assignOperator) > 0) {
        // call getTableEntry(table, key)
        _code.push_back("call _gettableentry");
        _code.push_back("pop a");
        _code.push_back("pop b");

        // a = table; b = key; c = value; fun = table entry value
        _code.push_back("pop c");
        _code.push_back(asmop[assignOperator] + " fun, c");

        // stack up the correct values
        _code.push_back("push fun");
        _code.push_back("push b");
        _code.push_back("push a");
    }
    else
        throw RuntimeError(std::string("Invalid setTableEntry tree for op ") + assignOperator);

    // call the method
    _code.push_back("call _settableentry");
    _code.push_back("pop a");
    _code.push_back("pop a");
    _code.push_back("pop a");
}

SetTableEntry::~SetTableEntry()
{
    delete _key;
    delete _value;
}

// ForEach
ForEach::ForEach(const EnvironmentVariable* index, const EnvironmentVariable* collection, ParseTree* block) : _block(block)
{
    // push an iterator in the stack
    concat(_code, collection->moveMyAddressToADR());
    _code.push_back("load a, adr");
    _code.push_back("push a");
    _code.push_back("call _gettableiterator");
    _code.push_back("pop a");
    _code.push_back("push fun");

    // push the table in the stack
    _code.push_back("push a");

    // loop
    _code.push_back(_labelBegin + ":");

    // is the iterator invalid?
    _code.push_back("call _tableiteratorisvalid");
    _code.push_back("lcmp fun, false");
    _code.push_back(std::string("je ") + _labelEnd);

    // store the key in index
    _code.push_back("call _getkeyfromtableiterator");
    concat(_code, index->moveMyAddressToADR());
    _code.push_back("store fun, adr");

    // foreach block
    for(std::list<std::string>::iterator it = _block->assemblyCode().begin(); it != _block->assemblyCode().end(); ++it)
        *it = strreplace("<loopend>", _labelEnd, *it); // delayed substitution
    _code.splice(_code.end(), _block->assemblyCode());

    // increment the iterator
    _code.push_back("call _incrementtableiterator");
    _code.push_back("pop a");
    _code.push_back("pop b"); // old iterator value
    _code.push_back("push fun"); // new iterator value
    _code.push_back("push a"); // table

    // end of the loop
    _code.push_back(std::string("jmp ") + _labelBegin);
    _code.push_back(_labelEnd + ":");

    // pop the table and the iterator from the stack
    _code.push_back("pop a");
    _code.push_back("pop a");
}

ForEach::~ForEach()
{
    delete _block;
}

// Variable
Variable::Variable(const EnvironmentVariable* var)
{
    concat(_code, var->moveMyAddressToADR());
    _code.push_back("load a, adr");
    _code.push_back("push a");
}

Variable::~Variable()
{
}

// Address of Variable
AddressOfVariable::AddressOfVariable(const EnvironmentVariable* var)
{
    concat(_code, var->moveMyAddressToADR());
    _code.push_back("push adr");
}

AddressOfVariable::~AddressOfVariable()
{
}

// Number
Number::Number(const std::string& num)
{
    _code.push_back(std::string("push ") + num);
}

Number::~Number()
{
}

// Boolean
Boolean::Boolean(const std::string& bol)
{
    _code.push_back(std::string("push ") + strtolower(bol));
}

Boolean::~Boolean()
{
}

// String
String::String(const std::string& str)
{
    _code.push_back(std::string("push ") + str);
}

String::~String()
{
}

// Assembly
Assembly::Assembly(const std::string& str)
{
    _code.push_back(strreplace("\\\"", "\"", str.substr(1, str.length()-2)));
}

Assembly::~Assembly()
{
}

} // namespace ccc;
