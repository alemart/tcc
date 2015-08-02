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

function Instruction(opcod, op1, op2) {
    var _data = [ opcod, op1, op2 ];
    for(var i=0; i<_data.length; i++) {
        var d = _data[i];
        if(typeof(d) != "number" && typeof(d) != "string" && typeof(d) != "boolean")// && d != undefined)
            throw new Error("Invalid machine instruction");
        else if(typeof(d) == "string")
            d = d.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // escape stuff
    }

    this.opcode = _data[0]; // OPTIMIZATION :: function() { return _data[0]; }
    this.operand1 = _data[1]; //function() { return _data[1]; }
    this.operand2 = _data[2]; //function() { return _data[2]; }
}
