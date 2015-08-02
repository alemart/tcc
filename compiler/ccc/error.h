//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _ERROR_H
#define _ERROR_H

#include <string>
#include <sstream>
#include "util.h"

namespace ccc
{

// <<abstract>>
// Error
class Error
{
public:
    virtual ~Error() throw() { }
    Error& operator=(const Error& err) throw() { _message = err._message; return *this; }
    virtual const std::string what() const throw() { return _message; }

protected:
    Error(const std::string& msg) throw() : _message(strreplace("\"\n\"", "line break", msg)) { }
    std::string _message;
};

// Lexical Error
class LexicalError : public Error
{
public:
    LexicalError(const std::string& msg, const std::string& line, int lineNumber) throw() : Error(msg), _line(line), _lineNumber(lineNumber) { }
    LexicalError(const LexicalError& err) throw() : Error(err.what()), _line(err._line), _lineNumber(err._lineNumber) { }
    virtual const std::string what() const throw() {
        std::stringstream ss;
        ss << "ccc - lexical error at line " << _lineNumber << ", near \"" << _line << "\": " << Error::what();
        return ss.str();
    }
    virtual ~LexicalError() throw() { }

private:
    std::string _line;
    int _lineNumber;
};

// Parser Error
class ParseError : public Error
{
public:
    ParseError(const std::string& msg, int lineNumber) throw() : Error(msg), _lineNumber(lineNumber) { }
    ParseError(const ParseError& err) throw() : Error(err.what()), _lineNumber(err._lineNumber) { }
    virtual const std::string what() const throw() {
        std::stringstream ss;
        ss << "ccc - parse error near line " << _lineNumber << ": " << Error::what();
        return ss.str();
    }
    virtual ~ParseError() throw() { }

private:
    int _lineNumber;
};

// Runtime Error
class RuntimeError : public Error
{
public:
    RuntimeError(const std::string& msg) throw() : Error(msg) { }
    RuntimeError(const RuntimeError& err) throw() : Error(err.what()) { }
    virtual const std::string what() const throw() {
        std::stringstream ss;
        ss << "ccc - runtime error: " << Error::what();
        return ss.str();
    }
    virtual ~RuntimeError() throw() { }
};

} // namespace ccc

#endif
