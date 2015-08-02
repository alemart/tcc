//
// Chinchilla Assembler
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
//

#include <cctype>
#include <sstream>
#include "lexer.h"

namespace ccasm
{

// register list
static const char *registers[] = {
    "PC",
    "SP",
    "BP",
    "CPF",
    "ADR",
    "FUN",
    "A",
    "B",
    "C",
    "D",

    NULL
};

// instruction list
static const char *instructions[] = {
    "NOP",
    "HALT",
    "MOV",
    "LOAD",
    "STORE",
    "SCMP",
    "FCMP",
    "LCMP",
    "JMP",
    "JE",
    "JNE",
    "JG",
    "JGE",
    "JL",
    "JLE",
    "PUSH",
    "POP",
    "CALL",
    "RET",
    "INT",

    "OR",
    "AND",
    "XOR",
    "NOT",

    "ADD",
    "SUB",
    "MUL",
    "DIV",
    "POW",
    "MOD",
    "NEG",
    "ACOS",
    "ASIN",
    "ATAN",
    "CEIL",
    "COS",
    "EXP",
    "FLOOR",
    "RND",
    "LOG",
    "SIN",
    "SQRT",
    "TAN",

    "LEN",
    "LEFT",
    "RIGHT",
    "CAT",
    "UPR",
    "LWR",
    "STR",
    "VAL",
    "TYPE",
    "ASC",
    "CHR",

    NULL
};


// convert to lower case
static std::string strtolower(const std::string& s)
{
    std::string x;

    for(int i=0; i<(int)s.length(); i++)
        x += tolower(s[i]);

    return x;
}


// trim
static std::string trim(const std::string& s)
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


// ---------------------------------------------

// constructor
Lexer::Lexer() : _lineNumber(0)
{
    const char **s;

    for(s=registers; *s; s++)
        _registers.insert(strtolower(std::string(*s)));

    for(s=instructions; *s; s++)
        _instructions.insert(strtolower(std::string(*s)));
}

// destructor
Lexer::~Lexer()
{
}

// feed line
void Lexer::feedLine(const std::string& rawLine) throw(LexicalError)
{
    std::string line(trim(rawLine)), lexeme;
    int i = 0, len = (int)line.length();
    bool backslash_mode = false, inside_double_quotes = false, got_a_dot = false, got_a_colon = false;

    ++_lineNumber;

    while(i < len) {

        // skip spaces
        for(; i<len && !inside_double_quotes && std::isspace((int)line[i]); i++);

        // special characters
        if(i < len && !inside_double_quotes) {
            if(line[i] == '-' || line[i] == '+') // number sign
                lexeme += line[i++];
            else if(line[i] == '.' && !got_a_dot) { // number dot
                if((i>0 && isdigit(line[i-1])) && (i<len-1 && isdigit(line[i+1]))) {
                    lexeme += line[i++];
                    got_a_dot = true;
                }
                else
                    throw LexicalError("misplaced dot", line, _lineNumber);
            }
            else if(line[i] == ':' && !got_a_colon) { // colon
                lexeme += line[i++];
                got_a_colon = true;
            }
            else if(line[i] == ',') // comma
                lexeme += line[i++];
            else if(line[i] == ';') // comments
                break;
        }

        // read token
        for(; i<len && lexeme != std::string(",") && (std::isalnum((int)line[i]) || line[i] == '_' || line[i] == '?' || line[i] == '$' || line[i] == '#' || line[i] == '"' || line[i] == '.' || line[i] == ':' || inside_double_quotes); i++) {
            // number dot
            if(line[i] == '.' && !inside_double_quotes) {
                if(got_a_dot || !((i>0 && isdigit(line[i-1])) && (i<len-1 && isdigit(line[i+1]))))
                    throw LexicalError("misplaced dot", line, _lineNumber);
                else
                    got_a_dot = true;
            }

            // colon
            if(line[i] == ':' && !inside_double_quotes) {
                if(got_a_colon)
                    throw LexicalError("misplaced colon", line, _lineNumber);
                else
                    got_a_colon = true;
            }

            // accumulating
            if(backslash_mode) {
                if(line[i] == '"' || line[i] == '\\' || line[i] == 'n' || line[i] == 'r' || line[i] == 't')
                    lexeme += std::string("\\") + line[i];
                else
                    throw LexicalError((std::string("invalid symbol \"\\") + line[i]) + std::string("\""), line, _lineNumber);

                backslash_mode = false;
            }
            else {
                if(line[i] != '\\') {
                    lexeme += line[i];
                    if(line[i] == '"') {
                        inside_double_quotes = !inside_double_quotes;
                        if(!inside_double_quotes) { i++; break; }
                    }
                }
                else
                    backslash_mode = true;
            }
        }

        // add token
        if(backslash_mode || inside_double_quotes)
            throw LexicalError("unexpected end of line", line, _lineNumber);
        else if(lexeme == ":")
            throw LexicalError("blank label name", line, _lineNumber);
        else if(lexeme == "")
            throw LexicalError("unrecognized symbol", line, _lineNumber);
        else
            _addToken(lexeme);

        // loop
        if(lexeme == "") i++;
        lexeme = "";
        got_a_dot = false;
        got_a_colon = false;
    }

    _addToken("\n");
}

// add token to the list
void Lexer::_addToken(const std::string& lexeme)
{
    _tokens.push_back(Token(_classify(lexeme), lexeme));
}

// retrieve next token
Token Lexer::getToken()
{
    if(_tokens.size() > 0) {
        Token t = _tokens.front();
        _tokens.pop_front();
        return t;
    }
    else
        return Token(ENDOFFILE, "");
}

// unget token
void Lexer::ungetToken(Token t)
{
    _tokens.push_front(t);
}

// classify a lexeme
TokenType Lexer::_classify(const std::string& lexeme)
{
    int i, len = (int)lexeme.length();

    // just to be sure...
    if(len == 0)
        return UNKNOWN;

    // --------------

    // instruction?
    if(_instructions.find(strtolower(lexeme)) != _instructions.end())
        return INSTRUCTION;

    // register?
    if(_registers.find(strtolower(lexeme)) != _registers.end())
        return REGISTER;

    // comma?
    if(lexeme == ",")
        return COMMA;

    // newline?
    if(lexeme == "\n")
        return NEWLINE;

    // boolean?
    if(strtolower(lexeme) == "true" || strtolower(lexeme) == "false")
        return BOOLEAN;

    // label?
    if(len > 1 && lexeme[len-1] == ':') {
        bool isLabel = (isalpha((int)lexeme[0]) || lexeme[0] == '_');
        for(i=0; i<len-1 && isLabel; i++) {
            char c = lexeme[i];
            isLabel = (isalnum((int)c) || c == '_' || c == '?' || c == '$' || c == '#');
        }
        if(isLabel)
            return LABEL;
    }

    // identifier?
    bool isIdentifier = (len > 0 && (isalpha((int)lexeme[0]) || lexeme[0] == '_'));
    for(i=0; i<len && isIdentifier; i++) {
        char c = lexeme[i];
        isIdentifier = (isalnum((int)c) || c == '_' || c == '?' || c == '$' || c == '#');
    }
    if(isIdentifier)
        return IDENTIFIER;

    // number?
    bool isNumber = (len > 1 && (lexeme[0] == '+' || lexeme[0] == '-' || lexeme[0] == '.')) || (len > 0 && isdigit((int)lexeme[0]));
    for(i=1; i<len && isNumber; i++) {
        char c = lexeme[i];
        isNumber = (isdigit((int)c) || c == '.');
    }
    if(isNumber)
        return NUMBER;

    // string?
    if(len >= 2 && lexeme[0] == '"' && lexeme[len-1] == '"')
        return STRING;

    // don't know
    return UNKNOWN;
}


} // namespace ccasm
