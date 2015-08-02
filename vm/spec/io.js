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

describe("I/O", function() {
    var io;

    beforeEach(function() {
        io = new IO(new DataMemory(65536));
    });

    it("should have the video device", function() {
        expect(io.video()).toBeDefined();
    });

    it("should have the audio device", function() {
        expect(io.audio()).toBeDefined();
    });

    it("should have the keyboard", function() {
        expect(io.keyboard()).toBeDefined();
    });

    it("should have the mouse", function() {
        expect(io.mouse()).toBeDefined();
    });

    it("should have the printer", function() {
        expect(io.printer()).toBeDefined();
    });
});
