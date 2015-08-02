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
function Registers() {
    var _registerList = {
        // special registers
        "PC" : 0,   // Program Counter
        "SP" : 1,   // Stack Pointer
        "BP" : 2,   // Base Pointer
        "CPF": 3,   // Comparsion flags
        "ADR": 4,   // Generic address
        "FUN": 5,   // Function return value

        // general purpose registers
        "A"  : 6,
        "B"  : 7,
        "C"  : 8,
        "D"  : 9
    };

    var _registerBank = new Array(10);


    // public stuff
    this.reset = function() {
        for(var i=0; i<_registerBank.length; i++)
            _registerBank[i] = 0;
    }

    this.read = function(registerCode) {
        /*if(typeof(registerCode) != "number")
            throw new Error("Weird register access");
        else if(registerCode < 0 || registerCode >= _registerBank.length)
            throw new Error("Invalid register code");*/

        return _registerBank[registerCode];
    }

    this.write = function(registerCode, value) {
        /*if(typeof(registerCode) != "number")
            throw new Error("Weird register access");
        else if(typeof(value) != "number" && typeof(value) != "string" && typeof(value) != "boolean")
            throw new Error("Weird register access");
        else if(registerCode < 0 || registerCode >= _registerBank.length)
            throw new Error("Invalid register code");*/

        return _registerBank[registerCode] = value;
    }

    this.getCode = function(registerName) {
        if(_registerList[registerName] == undefined)
            throw new Error("Invalid register name");

        return _registerList[registerName];
    }

    this.bank = _registerBank; // OPTIMIZATION

    // misc
    this.reset();
}
