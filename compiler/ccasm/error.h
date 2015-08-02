//
// Chinchilla Assembler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _ASMERROR_H
#define _ASMERROR_H

#include <string>
#include <sstream>

namespace ccasm
{

// <<abstract>>
// Error
class Error
{
public:
    virtual ~Error() throw() { }
    Error& operator=(const Error& err) throw() { _message = err._message; }
    virtual const std::string what() const throw() { return _message; }

protected:
    Error(const std::string& msg) throw() : _message(msg) { }
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
        ss << "ccasm - lexical error at line " << _lineNumber << ", near \"" << _line << "\": " << Error::what();
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
        ss << "ccasm - parse error near line " << _lineNumber << ": " << Error::what();
        return ss.str();
    }
    virtual ~ParseError() throw() { }

private:
    int _lineNumber;
};

} // namespace ccasm

#endif
