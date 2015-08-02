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

describe("Instruction Memory", function() {
    var im;

    beforeEach(function() {
        im = new InstructionMemory();
    });

    it("should start with no instructions", function() {
        expect(
            function() { im.get(0); }
        ).toThrow("Can't find instruction number 0");
    });

    it("should handle instructions correctly", function() {
        var i1 = new Instruction(0);
        var i2 = new Instruction(7);

        im.push(i1);
        im.push(i2);

        expect(im.get(0)).toEqual(i1);
        expect(im.get(1)).toEqual(i2);
    });
});
