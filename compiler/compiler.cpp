//
// Chinchilla Compiler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

#include <iostream>
#include <fstream>
#include <ctime>
#include <string>
#include <list>
#include "cgihtml/cgi-lib.h"
#include "ccc/error.h"
#include "ccc/parsetree.h"
#include "ccc/lexer.h"
#include "ccc/parser.h"
#include "ccasm/error.h"
#include "ccasm/lexer.h"
#include "ccasm/parser.h"

// the source code can't have more than MAX_LINES lines
const int MAX_LINES = 32768;

// chinchilla lib file
const char* CHINCHILLA_LIB_PATH = "./cclib.php";

// cgi utilities
static std::string request(llist& cgi, const std::string& field);
static std::string escape(const std::string& s);
static std::string timestr();
static void printHeader(const std::string& contentType);

// reads the Chinchilla Lib
static void readChinchillaLib(std::string& source, int& numberOfLines);

// main()
// main function
int main(int argc, char *argv[])
{
    std::string gameCode;

#ifndef DEBUG
    // is it a POST request?
    if(std::string(REQUEST_METHOD ? REQUEST_METHOD : "GET") == "POST") {
        // initialize cgi
        llist cgiInput;
        read_cgi_input(&cgiInput);
        gameCode = request(cgiInput, "code");
        list_clear(&cgiInput);
        printHeader("text/plain"); // print HTTP header
    }
    else {
        // decline non-POST requests
        printHeader("text/html"); // print HTTP header
        std::cout << "<html><body><img src=\"../pic.jpg\"></body></html>" << std::endl;
        return 0;
    }
#else
    {
        std::string line;
        std::cout << ":: DEBUG MODE ::" << std::endl;
        std::cout << "Please enter the source code:\n" << std::endl;
        while(std::getline(std::cin, line))
            gameCode += line + "\n";
    }
#endif

    // convert source code to assembly
    try {
        // reads the Chinchilla Library
        std::string cclibCode;
        int cclibLines = 0;
        readChinchillaLib(cclibCode, cclibLines);

        // the compiler
        ccc::Lexer l(cclibLines);
        ccc::Parser p;

        // getting input
        std::string s;
        std::stringstream inputStream(cclibCode + gameCode);

        // read code
        int cnt = 0;
        while(std::getline(inputStream, s)) {
            l.feedLine(s);
            if(++cnt >= MAX_LINES + l.initialLineNumber()) {
                std::stringstream ss;
                ss << "The source code is too long! It cannot have more than " << MAX_LINES << " lines.";
                throw ccc::RuntimeError(ss.str());
            }
        }

        // compile
        ccc::ParseTree* root = p.parse(&l);
        root->performSimpleCodeOptimization();

        // output
        std::list<std::string>& assembly = root->assemblyCode();

        // convert assembly to binary code
        try {
            ccasm::Lexer al;
            ccasm::Parser ap;

            // read code
            for(std::list<std::string>::const_iterator it = assembly.begin(); it != assembly.end(); ++it)
                al.feedLine(*it);
            al.feedLine("halt"); // just in case ;-)
#ifdef DEBUG
            for(std::list<std::string>::const_iterator it = assembly.begin(); it != assembly.end(); ++it)
                std::cout << *it << "\n";
            std::cout << "halt\n" << std::endl;
#endif
            // compile
            std::string binary(ap.parse(&al));

            // output
            std::cout << "{\"status\":\"ok\",\"data\":" << binary << "}";
        }
        catch(ccasm::Error& ea) {
            // error
            std::cout << "{\"status\":\"error\",\"data\":\"" << escape(ea.what()) << "\"}";
        }

        // thanks for compiling. bye!
        delete root;
    }
    catch(ccc::Error& e) {
        // error
        std::cout << "{\"status\":\"error\",\"data\":\"" << escape(e.what()) << "\"}";
    }

    // bye!
    return 0;
}

// request()
// requests a cgi variable
std::string request(llist& cgi, const std::string& field)
{
    const char *data = cgi_val(cgi, (char*)field.c_str());
    return data ? std::string(data) : std::string("");
}

// escape()
// escapes a string
std::string escape(const std::string& s)
{
    std::string x;

    for(int i=0; i<(int)s.length(); i++) {
        if(s[i] == '"')
            x += "\\\"";
        else if(s[i] == '\n')
            x += "\\n";
        else if(s[i] == '\r')
            x += "\\r";
        else if(s[i] == '\t')
            x += "\\t";
        else
            x += s[i];
    }

    return x;
}

// timestr()
// returns a string containing the current time in an appropriate format
std::string timestr()
{
    time_t rawtime = time(NULL);
    struct tm* timeinfo = std::gmtime(&rawtime);
    char buf[1024];

    strftime(buf, 1024, "%a, %d %b %Y %H:%M:%S GMT", timeinfo);
    return std::string(buf);
}

// printHeader()
// prints a http header
void printHeader(const std::string& contentType)
{
    std::cout << "Date: " << timestr() << std::endl;
    std::cout << "Last-Modified: " << timestr() << std::endl;
    std::cout << "Cache-Control: no-cache" << std::endl;
    std::cout << "Expires: -1" << std::endl;
    std::cout << "Pragma: no-cache" << std::endl;
    std::cout << "Content-type: " << contentType << std::endl;
    std::cout << std::endl;
}

// readChinchillaLib()
// reads the Chinchilla Lib
void readChinchillaLib(std::string& source, int& numberOfLines)
{
    std::string s;
    std::ifstream file(CHINCHILLA_LIB_PATH);

    if(file.is_open()) {
        for(numberOfLines = 0; std::getline(file, s); numberOfLines++)
            source += s + "\n";
    }
    else
        throw ccc::RuntimeError("Can't read CCLIB");
}
