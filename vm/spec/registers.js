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

describe("Registers", function() {
    var registers;

    beforeEach(function() {
        registers = new Registers();
    });

    it("should read and write values from/to the registers", function() {
        registers.write(registers.getCode("A"), 7);
        expect(registers.read(registers.getCode("A"))).toEqual(7);

        registers.write(registers.getCode("B"), 3.14);
        expect(registers.read(registers.getCode("B"))).toEqual(3.14);

        registers.write(registers.getCode("C"), 10);
        expect(registers.read(registers.getCode("C"))).toEqual(10);

        registers.write(registers.getCode("C"), "hi");
        expect(registers.read(registers.getCode("C"))).not.toEqual(10);

        registers.write(registers.getCode("C"), true);
        expect(registers.read(registers.getCode("C"))).toEqual(true);
    });

    it("can't write weird stuff", function() {
        expect(function() {
            registers.write(registers.getCode("PC"), function() { alert("h4ck3d!!!"); });
        }).toThrow("Weird register access");

        expect(function() {
            registers.write(registers.getCode("PC"), undefined);
        }).toThrow("Weird register access");

        expect(function() {
            registers.write(registers.getCode("PC"), null);
        }).toThrow("Weird register access");
    });

    it("can't access invalid registers", function() {
        expect(function() {
            registers.read(-1);
        }).toThrow("Invalid register code");

        expect(function() {
            registers.read(registers.getCode("BUG"));
        }).toThrow("Invalid register name");

        expect(function() {
            registers.write(registers.getCode("GUB"), 42);
        }).toThrow("Invalid register name");
    });
});
