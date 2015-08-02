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

describe("Data Memory", function() {
    var dataMemory;

    beforeEach(function() {
        dataMemory = new DataMemory(1024);
    });

    it("should have the RAM", function() {
        expect(dataMemory.ram()).toBeDefined();
    });

    it("should have the RAM with the correct capacity", function() {
        expect(dataMemory.ram().capacity()).toEqual(1024);
    });

    it("should have the media", function() {
        expect(dataMemory.media()).toBeDefined();
    });
});
