//                                        _                      __           
//    ____ _____ _____ ___  ___ _      __(_)___  ____ __________/ / __________
//   / __ `/ __ `/ __ `__ \/ _ \ | /| / / /_  / / __ `/ ___/ __  / / ___/ ___/
//  / /_/ / /_/ / / / / / /  __/ |/ |/ / / / /_/ /_/ / /  / /_/ /_/ /__/ /__  
//  \__, /\__,_/_/ /_/ /_/\___/|__/|__/_/ /___/\__,_/_/   \__,_/(_)___/\___/  
// /____/                                                                     
// 
// runtime engine
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// 

describe("Random Access Memory", function() {
    var ram;

    beforeEach(function() {
        ram = new RAM(1024);
    });

    it("should have the correct number of memory cells", function() {
        expect(ram.capacity()).toEqual(1024);
    });

    it("should be able to read and write", function() {
        ram.write(42, 1337);
        expect(ram.read(42)).toEqual(1337);

        ram.write(123, "hello, world!");
        expect(ram.read(123)).toEqual("hello, world!");

        ram.write(7, 3.1415926535);
        expect(ram.read(7)).toEqual(3.1415926535);

        ram.write(42, 0xdeadbeef);
        expect(ram.read(42)).toNotEqual(1337);
    });

    it("should throw an error when reading from invalid locations", function() {
        expect(
            function() { ram.read(-1); }
        ).toThrow("Out of bounds exception");

        expect(
            function() { ram.read(1024); }
        ).toThrow("Out of bounds exception");
    });

    it("should throw an error when writing to invalid locations", function() {
        expect(
            function() { ram.write(-1337, "ops!"); }
        ).toThrow("Out of bounds exception");

        expect(
            function() { ram.write(1337, 0xbeef); }
        ).toThrow("Out of bounds exception");
    });

    it("can't write weird stuff to the memory", function() {
        expect(
            function() { ram.write(0x0, function() { alert("h4x0r!!"); }); }
        ).toThrow("Weird memory access");
    });

    it("can't access weird locations", function() {
        expect(
            function() { ram.read("h4cK"); }
        ).toThrow("Weird memory access");
    });
});
