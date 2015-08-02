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

describe("Instruction", function() {
    var inst;

    beforeEach(function() {
        inst = new Instruction(0, 3.14, "hi");
    });

    it("should return the correct opcode", function() {
        expect(inst.opcode()).toEqual(0);
    });

    it("should return the correct operands", function() {
        expect(inst.operand1()).toEqual(3.14);
        expect(inst.operand2()).toEqual("hi");
    });

    it("should not accept invalid instructions", function() {
        expect(
            function() { var k = new Instruction(function() { alert("h4x0r"); }, null, undefined); }
        ).toThrow("Invalid machine instruction");
    });
});
