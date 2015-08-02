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

describe("Data Processing Unit", function() {
    var dpu;

    beforeEach(function() {
        dpu = new DPU();
    });

    // logic
    it("should handle logic operations: lor", function() {
        expect(dpu.lu().lor(true, true)).toEqual(true);
        expect(dpu.lu().lor(true, false)).toEqual(true);
        expect(dpu.lu().lor(false, true)).toEqual(true);
        expect(dpu.lu().lor(false, false)).toEqual(false);
    });

    it("should handle logic operations: land", function() {
        expect(dpu.lu().land(true, true)).toEqual(true);
        expect(dpu.lu().land(true, false)).toEqual(false);
        expect(dpu.lu().land(false, true)).toEqual(false);
        expect(dpu.lu().land(false, false)).toEqual(false);
    });

    it("should handle logic operations: lxor", function() {
        expect(dpu.lu().lxor(true, true)).toEqual(false);
        expect(dpu.lu().lxor(true, false)).toEqual(true);
        expect(dpu.lu().lxor(false, true)).toEqual(true);
        expect(dpu.lu().lxor(false, false)).toEqual(false);
    });

    it("should handle logic operations: lnot", function() {
        expect(dpu.lu().lnot(true)).toEqual(false);
        expect(dpu.lu().lnot(false)).toEqual(true);
    });

    it("should handle logic operations: lcmp", function() {
        expect(dpu.lu().lcmp(true, true)).toEqual(0);
        expect(dpu.lu().lcmp(true, false)).not.toEqual(0);
        expect(dpu.lu().lcmp(false, true)).not.toEqual(0);
        expect(dpu.lu().lcmp(false, false)).toEqual(0);
    });

    // floaating point
    it("should handle floating point operations: fadd", function() {
        expect(dpu.fpu().fadd(10, 20.5)).toEqual(30.5);
    });

    it("should handle floating point operations: fsub", function() {
        expect(dpu.fpu().fsub(1, -2)).toEqual(3);
    });

    it("should handle floating point operations: fmul", function() {
        expect(dpu.fpu().fmul(7, 8)).toEqual(56);
    });

    it("should handle floating point operations: fdiv", function() {
        expect(dpu.fpu().fdiv(21.21, 0.5)).toEqual(42.42);
    });

    it("should handle floating point operations: division by zero", function() {
        expect(dpu.fpu().fdiv(7, 0)).toEqual(Infinity);
    });

    it("should handle floating point operations: fneg", function() {
        expect(dpu.fpu().fneg(-1337)).toEqual(1337);
    });

    it("should handle floating point operations: fmod", function() {
        expect(dpu.fpu().fmod(7, 3)).toEqual(1);
    });

    it("should handle floating point operations: fcmp", function() {
        expect(dpu.fpu().fcmp(0, 0)).toEqual(0);
        expect(dpu.fpu().fcmp(7, 7)).toEqual(0);
        expect(dpu.fpu().fcmp(3.1415, 3.1415)).toEqual(0);

        expect(dpu.fpu().fcmp(0, 1)).toBeLessThan(0);
        expect(dpu.fpu().fcmp(20, 2011)).toBeLessThan(0);
        expect(dpu.fpu().fcmp(918, 129171)).toBeLessThan(0);

        expect(dpu.fpu().fcmp(19, 1)).toBeGreaterThan(0);
        expect(dpu.fpu().fcmp(7.74, 7.23)).toBeGreaterThan(0);
        expect(dpu.fpu().fcmp(8.71, 8.02)).toBeGreaterThan(0);
    });

    it("should handle floating point operations: fint", function() {
        expect(dpu.fpu().fint(7.24)).toEqual(7);
    });

    it("should handle floating point operations: fsqrt", function() {
        expect(dpu.fpu().fsqrt(16)).toEqual(4);
    });

    // string
    it("should handle string operations: slen", function() {
        expect(dpu.su().slen("hello")).toEqual(5);
        expect(dpu.su().slen("")).toEqual(0);
    });

    it("should handle string operations: smid", function() {
        expect(dpu.su().smid("boomerang", 0, 4)).toEqual("boom");
        expect(dpu.su().smid("boomerang", 0, 0)).toEqual("");
        expect(dpu.su().smid("boomerang", 2172, 1)).toEqual("");
        expect(dpu.su().smid("boomerang", 1, 2172)).toEqual("oomerang");
    });

    it("should handle string operations: scat", function() {
        expect(dpu.su().scat("boom", "erang")).toEqual("boomerang");
        expect(dpu.su().scat("boom", "")).toEqual("boom");
        expect(dpu.su().scat("", "boom")).toEqual("boom");
    });

    it("should handle string operations: supr", function() {
        expect(dpu.su().supr("WoW d00d!! SUPER stuff")).toEqual("WOW D00D!! SUPER STUFF");
    });

    it("should handle string operations: slwr", function() {
        expect(dpu.su().slwr("WoW d00d!! SUPER stuff")).toEqual("wow d00d!! super stuff");
    });

    it("should handle string operations: scmp", function() {
        expect(dpu.su().scmp("xyz", "ijk!!!")).toBeGreaterThan(0);
        expect(dpu.su().scmp("abc", "def")).toBeLessThan(0);
        expect(dpu.su().scmp("abc", "abc")).toEqual(0);
        expect(dpu.su().scmp("abc", "ABC")).not.toEqual(0);
    });
});
