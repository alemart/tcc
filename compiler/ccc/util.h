//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#ifndef _UTIL_H
#define _UTIL_H

#include <string>

// is str a global variable?
#define IS_GLOBALVAR(str)   ((str).length() >= 2 && (str)[0] == 'g' && (str)[1] == '_')

// convert to lower case
std::string strtolower(const std::string& s);

// trim
std::string trim(const std::string& s);

// similar to PHP's str_replace
std::string strreplace(const std::string& search, const std::string& replace, const std::string& subject);

#endif
