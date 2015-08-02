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

function Mouse(ram)
{
    var _me = this;
    this.baseAddress = function() { return 144; }

    // observer pattern
    this.notify = function(observable, arg) {
        switch(arg.msg) {
            case "mousemove":
                ram.write(_me.baseAddress() + 0, arg.xpos);
                ram.write(_me.baseAddress() + 1, arg.ypos);
                break;

            case "mousedown":
                var which = Math.min(3, Math.max(1, arg.button));
                ram.write(_me.baseAddress() + 2 + (which - 1), true);
                break;

            case "mouseup":
                var which = Math.min(3, Math.max(1, arg.button));
                ram.write(_me.baseAddress() + 2 + (which - 1), false);
                break;

            case "flipped":
                // copy to the old array
                for(var i=0; i<5; i++)
                    ram.write(_me.baseAddress() + 5 + i, ram.read(_me.baseAddress() + i));
                break;
        }
    }
}
