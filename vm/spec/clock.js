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

describe("Clock", function() {
    var clock;
    var a;
    var b;
    var video;

    beforeEach(function() {
        a = 0;
        b = 0;
        clock = new Clock(100, 200, function() { a += ++b + 1; }, null);
    });

    it("should start with zero ticks", function() {
        expect(clock.ticks()).toEqual(0);
    });

    it("should start with a = b = 0", function() {
        expect(a == 0 && b == 0).toBeTruthy();
    });

    it("should return the correct cyclesPerSecond value", function() {
        expect(clock.getCyclesPerSecond()).toEqual(100);
    });

    it("should return the correct instructionsPerCycle value", function() {
        expect(clock.getInstructionsPerCycle()).toEqual(200);
    });

/*    it("should have a > b > 0 after a while", function() {
        clock.start();
        // I'd need some "pause" command in here
        clock.stop();
        expect(a > b && b > 0).toBeTruthy();
    });*/
});
