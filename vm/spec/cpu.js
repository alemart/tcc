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

describe("CPU", function() {
    var cpu;

    beforeEach(function() {
        var instructionMemory = new InstructionMemory();
        var dataMemory = new DataMemory(65536);
        var io = new IO(dataMemory);

        cpu = new CPU(100, 100, io, instructionMemory, dataMemory);
    });

    it("should have a DPU", function() {
        expect(cpu.dpu()).toBeDefined();
    });

    it("should have registers", function() {
        expect(cpu.registers()).toBeDefined();
    });

    it("should have a control unit", function() {
        expect(cpu.controlUnit()).toBeDefined();
    });

    it("should have a clock", function() {
        expect(cpu.clock()).toBeDefined();
    });
});
