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

// -----------------------------
if(!window.requestAnimFrame) {
    window.requestAnimFrame = (function(){
         return window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function(callback, domElement) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();
}
// ---------------------------

function Clock(cyclesPerSecond, instructionsPerCycle, callback, ram) {
    if(typeof(cyclesPerSecond) != "number" || cyclesPerSecond <= 0)
        throw new Error("Clock error: invalid value for cycles per second");
    else if(typeof(instructionsPerCycle) != "number" || instructionsPerCycle <= 0)
        throw new Error("Clock error: invalid value for instructions per cycle");
    else if(typeof(callback) != "function")
        throw new Error("Clock error: invalid callback");

    // private stuff: clock
    var _me = this;
    var _ticks = 0;
    var _startTime = 0;
    var _stopped = true;
    var _videoFlipped = false;
    var _syncMode = false;

    // synchronized mode?
    function _runSync() {
        (function loop() { // runs at 60 fps
            try {
                if(!_stopped) {
                    var c = instructionsPerCycle;
                    while(!_videoFlipped && (c--)) {
                    //for(var i=0; _syncMode && !_videoFlipped && i < instructionsPerCycle; i++) {
                        callback(); // fetch-decode-execute
                        ++_ticks;
                    }
                    _videoFlipped = false;
    
                    if(_syncMode)
                        requestAnimFrame(loop);
                }
            }
            catch(e) {
                _me.stop();
                alert("FATAL ERROR:\n\n" + e.message);
            }
        })();
    }

    // not synchronized...
    function _runNoSync() {
        window.setTimeout(function() { // runs at maximum speed
            try {
                if(!_stopped) {
                    var c = instructionsPerCycle;
                    while(!_syncMode && (c--)) {
                    //for(var i=0; !_syncMode && i<instructionsPerCycle; i++) {
                        callback();
                        ++_ticks;
                    }

                    if(!_syncMode)
                        _runNoSync();
                }
            }
            catch(e) {
                _me.stop();
                alert("FATAL ERROR:\n\n" + e.message);
            }
        }, 1000.0 / cyclesPerSecond);
    }

    // enable/disable sync
    var _enableSyncMode = function() {
        _syncMode = true;
        _videoFlipped = false;
        _runSync();
    }

    var _disableSyncMode = function() {
        _syncMode = false;
        _videoFlipped = false;
        _runNoSync();
    }

    // observer pattern
    this.notify = function(observable, arg) {
        switch(arg.msg) {
            case "enabled double buffering":
                _enableSyncMode();
                break;

            case "disabled double buffering":
                _disableSyncMode();
                break;

            case "flipped":
                _videoFlipped = true;
                break;
        }
    }

    // write elapsed time to the ram
    if(ram != null) {
        var _elint = window.setInterval(function() {
            if(!_stopped)
                ram.write(288, (new Date()).getTime() - _startTime);
        }, 10);
    }

    // ---------------------------------------

    // public stuff
    this.getCyclesPerSecond = function() {
        return cyclesPerSecond;
    }

    this.getInstructionsPerCycle = function() {
        return instructionsPerCycle;
    }

    this.ticks = function() {
        return _ticks;
    }

    this.start = function() {
        _stopped = false;
        _syncMode = false;
        _videoFlipped = false;
        _startTime = (new Date()).getTime();
        _runNoSync();
    }

    this.stop = function() {
        _stopped = true;
        _syncMode = false;
        _videoFlipped = false;
        _startTime = 0;
        _ticks = 0;
    }
}
