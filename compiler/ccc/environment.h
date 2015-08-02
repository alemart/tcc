//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _ENVIRONMENT_H
#define _ENVIRONMENT_H

#include <sstream>
#include <string>
#include <map>
#include <list>
#include "error.h"

namespace ccc
{

// <<abstract>>
// what can we have in an environment?
class EnvironmentEntity
{
public:
    EnvironmentEntity();
    virtual ~EnvironmentEntity() = 0;
};

// a function?
class EnvironmentFunction : public EnvironmentEntity
{
public:
    EnvironmentFunction(const std::string& name, int arity);
    virtual ~EnvironmentFunction();
    virtual const std::string& label() const;
    virtual int arity() const;

private:
    std::string _label;
    int _arity;
};

// a variable?
class EnvironmentVariable : public EnvironmentEntity
{
public:
    EnvironmentVariable();
    virtual ~EnvironmentVariable() = 0;
    virtual int address() const = 0;
    virtual std::list<std::string> moveMyAddressToADR() const = 0; // moves the address of the variable to the ADR register
};

// a variable on the stack
class EnvironmentStackVariable : public EnvironmentVariable
{
public:
    EnvironmentStackVariable(int offset);
    virtual ~EnvironmentStackVariable();
    virtual int address() const;
    virtual std::list<std::string> moveMyAddressToADR() const;

private:
    int _offset;
};

// a static variable
class EnvironmentStaticVariable : public EnvironmentVariable
{
public:
    EnvironmentStaticVariable() throw(RuntimeError);
    virtual ~EnvironmentStaticVariable();
    virtual int address() const;
    virtual std::list<std::string> moveMyAddressToADR() const;

    static int initialAddress(); // beginning of static space
    static int finalAddress(); // beyond finalAddress(), no static variables should exist

private:
    int _address;
};

// Environment: symbol table
class Environment
{
public:
    Environment(Environment* parent = NULL);
    ~Environment();

    const EnvironmentFunction* getFunction(const std::string& name) const; // returns NULL if there's no such a fun
    const EnvironmentFunction* putFunction(const std::string& name, EnvironmentFunction* entity) throw(RuntimeError); // registers a function

    const EnvironmentVariable* getVariable(const std::string& name) throw(RuntimeError); // will create a local var if it doesn't exist
    const EnvironmentVariable* putVariable(const std::string& name, EnvironmentVariable* entity) throw(RuntimeError); // if you need more control on how a variable is created...

    Environment* parent() const;
    int numberOfLocalVariables() const; // number of vars on the stack

private:
    Environment* _parent;
    int _stackOffset;
    std::map<std::string,EnvironmentFunction*> _functions;
    std::map<std::string,EnvironmentVariable*> _stackVariables, _staticVariables;
};

} // namespace ccc

#endif
