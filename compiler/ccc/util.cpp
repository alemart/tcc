//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#include <string>
#include <cctype>
#include "util.h"

// convert to lower case
std::string strtolower(const std::string& s)
{
    int len = (int)s.length();
    std::string x;

    for(int i=0; i<len; i++)
        x += std::tolower(s[i]);

    return x;
}

// trim
std::string trim(const std::string& s)
{
    std::string str(s);

    std::string::size_type pos = str.find_last_not_of(" \t");
    if(pos != std::string::npos) {
        str.erase(pos+1);
        pos = str.find_first_not_of(" \t");
        if(pos != std::string::npos)
            str.erase(0, pos);
    }
    else
        str.erase(str.begin(), str.end());

    return str;
}

// similar to PHP's str_replace
std::string strreplace(const std::string& search, const std::string& replace, const std::string& subject)
{
    std::string s(subject);
    size_t pos, len = search.length();

    while((pos = s.find(search)) != std::string::npos)
        s.replace(pos, len, replace);

    return s;
}
