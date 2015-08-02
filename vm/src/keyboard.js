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

function Keyboard(ram)
{
    var _me = this;
    this.baseAddress = function() { return 304; }
    for(var i=0; i<512; i++)
        ram.write(_me.baseAddress() + i, false);

    $(document).keydown(function(ev) {
        var code = Math.max(0, Math.min(255, ev.which));
        ram.write(_me.baseAddress() + code, true);
    });

    $(document).keyup(function(ev) {
        var code = Math.max(0, Math.min(255, ev.which));
        ram.write(_me.baseAddress() + code, false);
    });

    // observer pattern
    this.notify = function(observable, arg) {
        switch(arg.msg) {
            case "flipped":
                // update old array
                for(var j=0; j<256; j++)
                    ram.write(_me.baseAddress() + j + 256, ram.read(_me.baseAddress() + j));
                break;
        }
    }
}
