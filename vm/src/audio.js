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

function AudioDevice(ram) {
    // 0.0 <= vol <= 1.0
    // loops: 1=play once; 2=play twice; etc
    this.play = function(voice, loops) { if(voice != null) voice.play(loops < 0 ? 9999999 : loops); }
    this.stop = function(voice) { if(voice != null) voice.stop(); }
    this.pause = function(voice) { if(voice != null) voice.pause(); }
    this.resume = function(voice) { if(voice != null) voice.resume(); }
    this.setPosition = function(voice, seconds) { if(voice != null) voice.setPosition(seconds); }
    this.getPosition = function(voice) { return (voice != null) ? voice.getPosition() : 0.0; } // in seconds
    this.setVolume = function(voice, volume) { if(voice != null) voice.setVolume(volume); }
    this.getVolume = function(voice) { return (voice != null) ? voice.getVolume(voice) : 0.5; }
    this.getDuration = function(voice) { return (voice != null) ? voice.getDuration() : 0.0; } // in seconds
    this.isPlaying = function(voice) { return (voice != null) ? voice.isPlaying() : false; }
}
