//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#include "environment.h"
#include "util.h"

#define IS_STATICVAR(str)   (_parent == NULL || IS_GLOBALVAR(str))

namespace ccc
{

// -------------- EnvironmentEntity -------------------
EnvironmentEntity::EnvironmentEntity()
{
}

EnvironmentEntity::~EnvironmentEntity()
{
}

// -------------- EnvironmentVariable -------------------
EnvironmentVariable::EnvironmentVariable()
{
}

EnvironmentVariable::~EnvironmentVariable()
{
}

// --------------- EnvironmentFunction ---------------
EnvironmentFunction::EnvironmentFunction(const std::string& name, int arity) : _label(std::string("_") + name), _arity(arity)
{
}

EnvironmentFunction::~EnvironmentFunction()
{
}

const std::string& EnvironmentFunction::label() const
{
    return _label;
}

int EnvironmentFunction::arity() const
{
    return _arity;
}

// -------------- EnvironmentStackVariable -------------
EnvironmentStackVariable::EnvironmentStackVariable(int offset) : _offset(offset)
{
}

EnvironmentStackVariable::~EnvironmentStackVariable()
{
}

int EnvironmentStackVariable::address() const
{
    return _offset;
}

std::list<std::string> EnvironmentStackVariable::moveMyAddressToADR() const
{
    std::stringstream ss;
    std::list<std::string> l;

    l.push_back("mov adr, bp");
    if(address() != 0) {
        ss << "add adr, " << address();
        l.push_back(ss.str());
    }

    return l;
}

// -------------- EnvironmentStaticVariable -------------
EnvironmentStaticVariable::EnvironmentStaticVariable() throw(RuntimeError)
{
    static int st = initialAddress();
    if((_address = st++) >= 1 + finalAddress())
        throw RuntimeError("Out of static space");
}

EnvironmentStaticVariable::~EnvironmentStaticVariable()
{
}

int EnvironmentStaticVariable::address() const
{
    return _address;
}

std::list<std::string> EnvironmentStaticVariable::moveMyAddressToADR() const
{
    std::stringstream ss;
    std::list<std::string> l;

    ss << "mov adr, " << address();
    l.push_back(ss.str());

    return l;
}

int EnvironmentStaticVariable::initialAddress()
{
    return 4096; // initial address for static variables
}

int EnvironmentStaticVariable::finalAddress()
{
    return 16383; // beyond this, you can't store any static variables
}

// ------------ Environment -----------------
Environment::Environment(Environment* parent) : _parent(parent), _stackOffset(0)
{
}

Environment::~Environment()
{
    // NO!!!!!
    //if(_parent)
    //    delete _parent;

    for(std::map<std::string,EnvironmentFunction*>::iterator it = _functions.begin(); it != _functions.end(); ++it)
        delete it->second;

    for(std::map<std::string,EnvironmentVariable*>::iterator it = _stackVariables.begin(); it != _stackVariables.end(); ++it)
        delete it->second;

    for(std::map<std::string,EnvironmentVariable*>::iterator it = _staticVariables.begin(); it != _staticVariables.end(); ++it)
        delete it->second;
}


const EnvironmentFunction* Environment::getFunction(const std::string& name) const
{
    if(NULL == _parent) {
        std::map<std::string,EnvironmentFunction*>::const_iterator it = _functions.find(strtolower(name));
        return (it == _functions.end()) ? NULL : it->second;
    }
    else
        return _parent->getFunction(name);
}

const EnvironmentVariable* Environment::getVariable(const std::string& name) throw(RuntimeError)
{
    const std::map<std::string,EnvironmentVariable*>& table(IS_STATICVAR(name) ? _staticVariables : _stackVariables);
    std::map<std::string,EnvironmentVariable*>::const_iterator it = table.find(strtolower(name));

    if(it == table.end()) { // var doesn't exist
        if((_parent == NULL) || (_parent != NULL && _parent->_parent == NULL && !IS_GLOBALVAR(name))) { // global scope OR (function scope AND local var)
            EnvironmentVariable* var;
            if(IS_STATICVAR(name))
                var = new EnvironmentStaticVariable();
            else
                var = new EnvironmentStackVariable(_stackOffset--);

            return putVariable(name, var);
        }
        else // a global var in a function scope
            return _parent->getVariable(name);
    }
    else
        return it->second;
}

const EnvironmentFunction* Environment::putFunction(const std::string& name, EnvironmentFunction* entity) throw(RuntimeError)
{
    if(NULL == _parent) {
        std::map<std::string,EnvironmentFunction*>::iterator it = _functions.find(strtolower(name));
        if(it != _functions.end())
            throw RuntimeError((std::string("symbol table - duplicate entry of function '") + name) + "'");
        _functions.insert(std::pair<std::string,EnvironmentFunction*>(strtolower(name),entity));
        return entity;
    }
    else
        return _parent->putFunction(name, entity);
}

const EnvironmentVariable* Environment::putVariable(const std::string& name, EnvironmentVariable* entity) throw(RuntimeError)
{
    if(!IS_GLOBALVAR(name) || (NULL == _parent)) {
        std::map<std::string,EnvironmentVariable*>& table(IS_STATICVAR(name) ? _staticVariables : _stackVariables);
        std::map<std::string,EnvironmentVariable*>::iterator it = table.find(strtolower(name));
        if(it != table.end())
            throw RuntimeError((std::string("symbol table - duplicate entry of variable '") + name) + "'");
        table.insert(std::pair<std::string,EnvironmentVariable*>(strtolower(name),entity));
        return entity;
    }
    else
        return _parent->putVariable(name, entity);
}

Environment* Environment::parent() const
{
    return _parent;
}

int Environment::numberOfLocalVariables() const
{
    return -(_stackOffset);
}

} // namespace ccc
