# compiler
all: compiler compiler_debug
	g++ compiler.o cgihtml/*.o ccasm/*.o ccc/*.o -o compiler
	g++ compiler_debug.o cgihtml/*.o ccasm/*.o ccc/*.o -o compiler_debug

compiler: compiler.cpp cgihtml ccasmlexer ccasmparser ccclexer cccenvironment cccparser cccparsetree cccutil
	g++ -c compiler.cpp -o compiler.o

compiler_debug: compiler.cpp cgihtml ccasmlexer ccasmparser ccclexer cccenvironment cccparser cccparsetree cccutil
	g++ -DDEBUG -c compiler.cpp -o compiler_debug.o

# ccc
ccclexer: ccc/lexer.cpp ccc/lexer.h ccc/token.h ccc/error.h cccutil
	g++ -c ccc/lexer.cpp -o ccc/lexer.o

cccparser: ccc/parser.cpp ccc/parser.h ccc/token.h ccc/error.h ccclexer cccenvironment cccparsetree cccutil
	g++ -c ccc/parser.cpp -o ccc/parser.o

cccenvironment: ccc/environment.cpp ccc/environment.h ccc/error.h cccutil
	g++ -c ccc/environment.cpp -o ccc/environment.o

cccutil: ccc/util.cpp ccc/util.h
	g++ -c ccc/util.cpp -o ccc/util.o

cccparsetree: ccc/parsetree.cpp ccc/parsetree.h ccc/error.h
	g++ -c ccc/parsetree.cpp -o ccc/parsetree.o

# ccasm
ccasmlexer: ccasm/lexer.cpp ccasm/lexer.h ccasm/error.h
	g++ -c ccasm/lexer.cpp -o ccasm/lexer.o

ccasmparser: ccasm/parser.cpp ccasm/parser.h ccasm/error.h
	g++ -c ccasm/parser.cpp -o ccasm/parser.o

# cgihtml lib
cgihtml: cgi-lib cgi-llist html-lib string-lib

cgi-lib: cgihtml/cgi-lib.c cgihtml/cgi-lib.h
	g++ -c cgihtml/cgi-lib.c -o cgihtml/cgi-lib.o

cgi-llist: cgihtml/cgi-llist.c cgihtml/cgi-llist.h
	g++ -c cgihtml/cgi-llist.c -o cgihtml/cgi-llist.o

html-lib: cgihtml/html-lib.c cgihtml/html-lib.h
	g++ -c cgihtml/html-lib.c -o cgihtml/html-lib.o

string-lib: cgihtml/string-lib.c cgihtml/string-lib.h
	g++ -c cgihtml/string-lib.c -o cgihtml/string-lib.o

# clean target
clean:
	rm -rf cgihtml/*.o
	rm -rf ccasm/*.o
	rm -rf ccc/*.o
	rm -rf *.o
	rm -rf compiler
