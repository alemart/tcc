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

function IO(dataMemory) {
    var _printer = new Printer();
    var _video = new VideoDevice(dataMemory.ram());
    var _audio = new AudioDevice(dataMemory.ram());
    var _keyboard = new Keyboard(dataMemory.ram());
    var _mouse = new Mouse(dataMemory.ram());

    _video.registerObserver(_mouse);
    _video.registerObserver(_keyboard);

    this.printer = function() { return _printer; }
    this.video = function() { return _video; }
    this.audio = function() { return _audio; }
    this.keyboard = function() { return _keyboard; }
    this.mouse = function() { return _mouse; }
}
