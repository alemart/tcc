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

describe("Printer", function() {
    var printer;

    beforeEach(function() {
        printer = new Printer();
    });

    it("should be able to print stuff", function() {
        printer.print("stuff");
        expect(printer.text().indexOf("stuff") != -1).toBeTruthy();
        expect(printer.text().indexOf("foo") != -1).toBeFalsy();

        printer.print("foo");
        expect(printer.text().indexOf("stuff")).toNotEqual(-1);
        expect(printer.text().indexOf("foo")).toNotEqual(-1);
    });
});
