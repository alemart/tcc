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

describe("Control Unit", function() {
    var io;
    var dataMemory;
    var instructionMemory;
    var dpu;
    var registers;
    var cu;

    beforeEach(function() {
        dataMemory = new DataMemory(65536);
        instructionMemory = new InstructionMemory();
        io = new IO(dataMemory);
        dpu = new DPU();
        registers = new Registers();
        cu = new ControlUnit(registers, dpu, io, instructionMemory, dataMemory);
    });

    it("should not accept illegal instructions", function() {
        expect(
            function() { cu.getOpcode("EVIL"); }
        ).toThrow("Illegal instruction");
    });

    it("should update the Program Counter", function() {
        var pc = registers.getCode("PC");
        var inst = new Instruction(cu.getOpcode("NOP"), 0, 0);
        var x;

        instructionMemory.push(inst);

        x = registers.read(pc);
        cu.fetchDecodeExecute();
        expect(registers.read(pc)).toEqual(x + 1);
    });

    it("should handle the MOVC instruction", function() {
        var reg = registers.getCode("A");
        var inst = new Instruction(cu.getOpcode("MOVC"), reg, 1337);

        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(reg)).toEqual(1337);
    });

    it("should handle the MOVR instruction", function() {
        var reg1 = registers.getCode("A");
        var reg2 = registers.getCode("B");
        var inst = new Instruction(cu.getOpcode("MOVR"), reg2, reg1);

        registers.write(reg1, 0xbeef);
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(reg2)).toEqual(0xbeef);
    });

    it("should handle the LOADC instruction", function() {
        var reg = registers.getCode("A");
        var inst = new Instruction(cu.getOpcode("LOADC"), reg, 0x7);

        dataMemory.ram().write(0x7, "hello!");
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(reg)).toEqual("hello!");
    });

    it("should handle the LOADR instruction", function() {
        var reg1 = registers.getCode("A");
        var reg2 = registers.getCode("ADR");
        var inst = new Instruction(cu.getOpcode("LOADR"), reg1, reg2);

        dataMemory.ram().write(0xab, "ABBA");
        registers.write(reg2, 0xab);
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(reg1)).toEqual("ABBA");
    });

    it("should handle the STOREC instruction", function() {
        var reg = registers.getCode("A");
        var inst = new Instruction(cu.getOpcode("STOREC"), reg, 0x7);

        registers.write(reg, "hey, you!");
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(dataMemory.ram().read(0x7)).toEqual("hey, you!");
    });

    it("should handle the STORER instruction", function() {
        var reg1 = registers.getCode("ADR");
        var reg2 = registers.getCode("B");
        var inst = new Instruction(cu.getOpcode("STORER"), reg2, reg1);

        registers.write(reg1, 0x7);
        registers.write(reg2, 42);
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(dataMemory.ram().read(0x7)).toEqual(42);
    });

    it("should handle the LCMPC instruction", function() {
        var cmp = registers.getCode("CPF");
        var reg = registers.getCode("A");
        var inst = new Instruction(cu.getOpcode("LCMPC"), reg, true);

        registers.write(reg, true);
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(cmp)).toEqual(0);
    });

    it("should handle the LCMPR instruction", function() {
        var cmp = registers.getCode("CPF");
        var reg = registers.getCode("A");
        var reg2 = registers.getCode("B");
        var inst = new Instruction(cu.getOpcode("LCMPR"), reg, reg2);

        registers.write(reg, true);
        registers.write(reg2, false);
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(cmp)).not.toEqual(0);
    });

    it("should handle the FCMPC instruction", function() {
        var cmp = registers.getCode("CPF");
        var reg = registers.getCode("A");
        var inst = new Instruction(cu.getOpcode("FCMPC"), reg, 3.14);

        registers.write(reg, 3.14);
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(cmp)).toEqual(0);
    });

    it("should handle the FCMPR instruction", function() {
        var cmp = registers.getCode("CPF");
        var reg = registers.getCode("A");
        var reg2 = registers.getCode("B");
        var inst = new Instruction(cu.getOpcode("FCMPR"), reg, reg2);

        registers.write(reg, 2.73);
        registers.write(reg2, 2.74);
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(cmp)).toBeLessThan(0);
    });

    it("should handle the SCMPC instruction", function() {
        var cmp = registers.getCode("CPF");
        var reg = registers.getCode("A");
        var inst = new Instruction(cu.getOpcode("SCMPC"), reg, "oi!");

        registers.write(reg, "oi!");
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(cmp)).toEqual(0);
    });

    it("should handle the SCMPR instruction", function() {
        var cmp = registers.getCode("CPF");
        var reg = registers.getCode("A");
        var reg2 = registers.getCode("B");
        var inst = new Instruction(cu.getOpcode("SCMPR"), reg, reg2);

        registers.write(reg, "abc");
        registers.write(reg2, "xyz");
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(cmp)).toBeLessThan(0);
    });

    it("should handle the JMPC instruction", function() {
        var pc = registers.getCode("PC");
        var inst = new Instruction(cu.getOpcode("JMPC"), 0x7, 0);

        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(pc)).toEqual(0x7);
    });

    it("should handle the JMPR instruction", function() {
        var reg = registers.getCode("A");
        var pc = registers.getCode("PC");
        var inst = new Instruction(cu.getOpcode("JMPR"), reg, 0);

        registers.write(reg, 0x7);
        instructionMemory.push(inst);

        cu.fetchDecodeExecute();
        expect(registers.read(pc)).toEqual(0x7);
    });

    it("should handle the PUSHC/POP instructions", function() {
        var reg = registers.getCode("A");
        var inst = new Instruction(cu.getOpcode("PUSHC"), "hi", 0);
        var inst2 = new Instruction(cu.getOpcode("POP"), reg, 0);

        instructionMemory.push(inst);
        instructionMemory.push(inst2);

        cu.fetchDecodeExecute();
        cu.fetchDecodeExecute();
        expect(registers.read(reg)).toEqual("hi");
    });

    it("should handle the PUSHR/POP instructions", function() {
        var reg = registers.getCode("A");
        var reg2 = registers.getCode("B");
        var inst = new Instruction(cu.getOpcode("PUSHR"), reg, 0);
        var inst2 = new Instruction(cu.getOpcode("POP"), reg2, 0);

        registers.write(reg, "cheese");
        instructionMemory.push(inst);
        instructionMemory.push(inst2);

        cu.fetchDecodeExecute();
        cu.fetchDecodeExecute();
        expect(registers.read(reg2)).toEqual("cheese");
    });

    it("should handle the CALLC/RET instructions", function() {
        var reg = registers.getCode("A");
        var inst = new Instruction(cu.getOpcode("CALLC"), 0x5, 0);
        var inst2 = new Instruction(cu.getOpcode("MOVC"), reg, 7);
        var inst3 = new Instruction(cu.getOpcode("NOP"), 0, 0);
        var inst4 = new Instruction(cu.getOpcode("NOP"), 0, 0);
        var inst5 = new Instruction(cu.getOpcode("MOVC"), reg, 17);
        var inst6 = new Instruction(cu.getOpcode("NOP"), 0, 0);
        var inst7 = new Instruction(cu.getOpcode("RET"), 0, 0);

        registers.write(reg, 1);

        instructionMemory.push(inst);
        instructionMemory.push(inst2);
        instructionMemory.push(inst3);
        instructionMemory.push(inst4);
        instructionMemory.push(inst5);
        instructionMemory.push(inst6);
        instructionMemory.push(inst7);

        cu.fetchDecodeExecute();
        cu.fetchDecodeExecute();
        expect(registers.read(reg)).toEqual(1);
        cu.fetchDecodeExecute();
        cu.fetchDecodeExecute();
        expect(registers.read(reg)).toEqual(7);
        cu.fetchDecodeExecute();
        cu.fetchDecodeExecute();
        cu.fetchDecodeExecute();
        expect(registers.read(reg)).toEqual(17);
    });
});
