// ------------------------------------------------------------------
// soundlib javascript
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
// ------------------------------------------------------------------

// soundlib: Singleton
soundlib = {
    _ready: function() { },
    _timeout: function() { },
    html5Test: /^(probably|maybe)$/i
};

// can play the url? true/false
// tech = optional parameter: "flash" or "html5". Can we play
// the sound using the specified technology? If not specified,
// returns true if the sound can be played using one or another
soundlib.canPlayURL = function(url, tech) {
    var m = url.match(/\.[a-z0-9]+$/i);
    if(m != null) {
        var ext = m[0].substr(1).toLowerCase();
        var type = {
            'mp3': ['audio/mpeg; codecs="mp3"','audio/mpeg','audio/mp3','audio/MPA','audio/mpa-robust'],
            'mp4': ['audio/mp4; codecs="mp4a.40.2"','audio/aac','audio/x-m4a','audio/MP4A-LATM','audio/mpeg4-generic'],
            'aac': ['audio/mp4; codecs="mp4a.40.2"','audio/aac','audio/x-m4a','audio/MP4A-LATM','audio/mpeg4-generic'],
            'm4a': ['audio/mp4; codecs="mp4a.40.2"','audio/aac','audio/x-m4a','audio/MP4A-LATM','audio/mpeg4-generic'],
            'ogg': ['audio/ogg; codecs=vorbis'],
            'wav': ['audio/wav; codecs="1"','audio/wav','audio/wave','audio/x-wav'],
            'webm':['audio/webm'],
            'mid': ['audio/mid'],
            'rmi': ['audio/rmi']
        };

        // can it be played with Flash? TODO
        //if(tech == undefined || tech == "flash") {
        //}

        // can it be played with HTML5 Audio?
        if(tech == undefined || tech == "html5") {
            if(type[ext] != undefined) {
                var a = soundlib._createHTML5Audio();
                var list = type[ext];
                for(var t in list) {
                    if(a.canPlayType(list[t]).match(soundlib.html5Test) != null)
                        return true;
                }
            }
        }
    }

    return false;
}


// ================= private ===========================

// OOP stuff
soundlib._subclassResponsibility = function() {
    alert("Can't instantiate abstract class");
    return null;
};

// interfaces
soundlib._implements = function(myInterface, myImplementation) {
    return function() {
        var base = new myInterface;
        for(var property in base)
            this[property] = base[property];
        myImplementation.apply(this, arguments);
    };
};

// non-destructive merge
soundlib._merge = function(main, add) {
    var m = {}, i;

    for(i in main) {
        if(main.hasOwnProperty(i))
            m[i] = main[i];
    }

    if(add != undefined) {
        for(i in add) {
            if(add.hasOwnProperty(i))
                m[i] = add[i];
        }
    }

    return m;
}

// default sound options
soundlib._defaultSoundOptions = {
    url: '',
    volume: 0.5,
    timeout: 10000,
    ontimeout: function() { },
    onfinish: function() { },
    onstop: function() { },
    onpause: function() { },
    onplay: function() { },
    onresume: function() { },
    oncanplaythrough: function() { },
    onerror: function() { }
};

// creates a HTML5 Audio object
soundlib._createHTML5Audio = function() {
    var a = null;

    try {
        a = new Audio();
    }
    catch(e1) {
        try {
            a = new Audio(null);
        }
        catch(e2) {
            try {
                a = document.createElement('audio');
            }
            catch(e3) {
                throw new Error("Can't create HTML5 Audio object: " + e1.message + "," + e2.message + "," + e3.message);
            }
        }
    }

    return a;
}





// ===============================================



// sound interface
soundlib.Sound = function(options) {
    // destructor
    this.destruct = function() { soundlib._subclassResponsibility(); }

    // clone
    this.clone = function() { return soundlib._subclassResponsibility(); }

    // plays a sound
    // loops: 1 = play once, 2 = play twice, etc.
    this.play = function(loops) { soundlib._subclassResponsibility(); }

    // stops a sound
    this.stop = function() { soundlib._subclassResponsibility(); }

    // pauses a sound
    this.pause = function() { soundlib._subclassResponsibility(); }

    // resumes a sound
    this.resume = function() { soundlib._subclassResponsibility(); }

    // set volume
    // volume: 0.0 <= volume <= 1.0
    this.setVolume = function(volume) { soundlib._subclassResponsibility(); }

    // get volume
    this.getVolume = function() { return soundlib._subclassResponsibility(); }

    // set position
    this.setPosition = function(seconds) { soundlib._subclassResponsibility(); }

    // get position
    this.getPosition = function() { return soundlib._subclassResponsibility(); }

    // get duration
    this.getDuration = function() { return soundlib._subclassResponsibility(); }

    // is playing?
    this.isPlaying = function() { return soundlib._subclassResponsibility(); }
};




// ===============================================



// Silent Sound (no drivers)
soundlib._SilentSound = soundlib._implements(soundlib.Sound, function(options) {
    // public methods
    this.clone = function() { return new soundlib._SilentSound; }
    this.destruct = function() { }
    this.play = function(loops) { }
    this.stop = function() { }
    this.pause = function() { }
    this.resume = function() { }
    this.setVolume = function(volume) { }
    this.getVolume = function() { return 0; }
    this.setPosition = function(seconds) { }
    this.getPosition = function() { return 0; }
    this.getDuration = function() { return 0; }
    this.isPlaying = function() { return false; }

    // go!
    options.oncanplaythrough();
});




// ===============================================

// Buzz Library (firefox doesn't like it...)
soundlib._BuzzSound = soundlib._implements(soundlib.Sound, function(options) {
    // private
    var _me = this;
    var _playing = false;
    var _loopsLeft = 0;
    var _neverAgain = false;
    var _sound = new buzz.sound(options.url, {preload: true, loop:false, autoplay:false});
    _sound.bind("error", function(e) {
        //throw new Error("Can't play '" + options.url + "': " + this.getErrorMessage());
        options.onerror();
    }).bind("canplaythrough", function() { 
        if(!_neverAgain) {
            options.oncanplaythrough();
            _neverAgain = true;
        } // firefox bug?
    }).bind("ended", function() {
        if(_loopsLeft > 0)
            _me.play(_loopsLeft - 1);
        else {
            options.onfinish();
            _playing = false;
        }
    }).bind("playing", function() {
        options.onplay();
    }).bind("play", function() {
        options.onresume();
    }).bind("pause", function() {
        if(_sound.getTime() > 0)
            options.onstop();
        else
            options.onpause();
    });

    // public methods
    this.clone = function() { 
        var opt = soundlib._merge(soundlib._defaultSoundOptions, {url: options.url, volume: options.volume });
        return new soundlib._BuzzSound(opt);
    }
    this.destruct = function() {
        try {
            _sound.unbind("error");
            _sound.unbind("canplaythrough");
            _sound.unbind("ended");
            _sound.unbind("playing");
            _sound.unbind("play");
            _sound.unbind("pause");
        } catch(e) { }
        _sound.stop();
        delete _sound;
    }
    this.play = function(loops) { _sound.stop(); _sound.play(); _playing = true; }
    this.stop = function() { _sound.stop(); _playing = false; }
    this.pause = function() { _sound.pause(); _playing = false; }
    this.resume = function() { _playing = true; _sound.play(); }
    this.setVolume = function(volume) { _sound.setVolume(100 * volume); }
    this.getVolume = function() { return 0.01 * _sound.getVolume(); }
    this.setPosition = function(seconds) { _sound.setTime(seconds); }
    this.getPosition = function() { return _sound.getTime(); }
    this.getDuration = function() { return _sound.getDuration(); }
    this.isPlaying = function() { return _playing && !_sound.isEnded(); }
});





// ===============================================
// AudioContext sound
if(typeof AudioContext == 'function')
    soundlib._AudioContext = new AudioContext();
else if(typeof webkitAudioContext == 'function')
    soundlib._AudioContext = new webkitAudioContext();
else
    soundlib._AudioContext = null;

soundlib._AudioContextSound = soundlib._implements(soundlib.Sound, function(options, buffer) {
    // private
    var _me = this;
    var _ctx = soundlib._AudioContext;
    if(!_ctx) throw new Error("Invalid AudioContext");
    var _src = null;
    var _gain = null;
    var _startTime = _ctx.currentTime;
    var _pausedTime = 0;
    var _int = null;
    var _loopsLeft = 0;
    var _playing = false;

    // load sound
    (function() {
        if(buffer == undefined) {
            var request = new XMLHttpRequest();
            request.open('GET', options.url, true);
            request.responseType = 'arraybuffer';
            request.onload = (function() {
                _ctx.decodeAudioData(request.response, function(buf) {
                    _src = _ctx.createBufferSource();
                    _src.buffer = buf;
                    _gain = _ctx.createGainNode();
                    _src.connect(_gain);
                    _gain.connect(_ctx.destination);
                    options.oncanplaythrough();
                }, function(e) {
                    options.onerror();
                    //throw new Error("Can't decode sound '" + options.url + "': " + e);
                });
            });
            request.send();
        }
        else {
            _src = _ctx.createBufferSource();
            _src.buffer = buffer;
            _gain = _ctx.createGainNode();
            _src.connect(_gain);
            _gain.connect(_ctx.destination);
        }
    })();

    _int = setInterval(function() {
        if(_src && _src.buffer && _playing) {
            if(_ctx.currentTime - _startTime >= _src.buffer.duration) {
                if(_loopsLeft > 0)
                    _me.play(_loopsLeft - 1);
                else {
                    options.onfinish();
                    _playing = false;
                }
            }
        }
    }, 200);

    // public methods
    this.clone = function() { 
        var opt = soundlib._merge(soundlib._defaultSoundOptions, {url: options.url, volume: options.volume});
        return new soundlib._AudioContextSound(opt, _src.buffer);
    }
    this.destruct = function() {
        _me.stop();
        clearInterval(_int);
        delete _gain;
        delete _src;
    }
    this.play = function(loops) {
        var buffer = _src.buffer;
        delete _gain;
        delete _src;

        _src = _ctx.createBufferSource();
        _src.buffer = buffer;
        _gain = _ctx.createGainNode();
        _src.connect(_gain);
        _gain.connect(_ctx.destination);

        _loopsLeft = loops == undefined ? 0 : loops;
        _startTime = _ctx.currentTime;
        _playing = true;
        _src.noteOn(0);
        options.onplay();
    }
    this.stop = function() {
        _src.noteOff(0);
        _playing = false;
        options.onstop();
    }
    this.pause = function() {
        _pausedTime = _ctx.currentTime - _startTime;
        _src.noteOff(0);
        _playing = false;
        options.onpause();
    }
    this.resume = function() {
        var buffer = _src.buffer;
        delete _gain;
        delete _src;

        _src = _ctx.createBufferSource();
        _src.buffer = buffer;
        _gain = _ctx.createGainNode();
        _src.connect(_gain);
        _gain.connect(_ctx.destination);

        _startTime = _ctx.currentTime - _pausedTime;
        _playing = true;
        _src.noteGrainOn(0, _pausedTime, _src.buffer.duration - _pausedTime);
        options.onresume();
    }
    this.setVolume = function(volume) { _gain.gain.value = (100 * volume) * (100 * volume); }
    this.getVolume = function() { return Math.sqrt(_gain.gain.value) / 100; }
    this.setPosition = function(seconds) { _src.noteOff(0); _src.noteGrainOn(0, seconds, _src.buffer.duration - seconds); }
    this.getPosition = function() { return Math.min(_src.buffer.duration, _ctx.currentTime - _startTime); }
    this.getDuration = function() { return _src.buffer.duration; }
    this.isPlaying = function() { return _playing; }
});






// ===============================================



// HTML5 sound
soundlib._HTML5Sound = soundlib._implements(soundlib.Sound, function(options, html5AudioObject) {
    // private data
    var _me = this;
    var _loopsLeft = 0;
    var _paused = false;
    var _loaded = false;
    var _playing = false;
    var _timedout = false;

    // html5 audio
    var _audio = null;
    if(html5AudioObject == undefined) {
        _audio = soundlib._createHTML5Audio();
        _audio.volume = options.volume;

        _audio.addEventListener("error", function(ev) {
            options.onerror(ev);
        }, false);

        _audio.addEventListener("canplaythrough", function() {
            if(!_loaded) {
                _loaded = true;
                if(!_timedout)
                    options.oncanplaythrough();
            }
        }, false);

        _audio.addEventListener("ended", function() {
            if(_loopsLeft <= 0) {
                _playing = false;
                options.onfinish();
            }
            else
                _me.play(_loopsLeft - 1);
        }, false);

        setTimeout(function() {
            _timedout = true;
            if(!_loaded)
                options.ontimeout();
        }, options.timeout);

        _audio.autoplay = false;
        _audio.controls = false;
        _audio.src = options.url;
        _audio.load();
    }
    else {
        _audio = html5AudioObject;
        _audio.volume = options.volume;

        _audio.addEventListener("canplaythrough", function() {
            _loaded = true;
        }, false);

        _audio.addEventListener("ended", function() {
            if(_loopsLeft <= 0)
                _playing = false;
            else
                _me.play(_loopsLeft - 1);
        }, false);
    }

    // public methods
    this.destruct = function() { // this audio object can't be used anymore
        try { _audio.pause(); _audio.currentTime = 0; } catch(e) { }
        _paused = _playing = false;
        delete _audio;
    }

    this.clone = function() {
        var opt = soundlib._merge(soundlib._defaultSoundOptions, {url: options.url, volume: options.volume});
        return new soundlib._HTML5Sound(opt, _audio.cloneNode(true));
    }

    this.play = function(loops) {
        if(_loaded) {
            try {
                _loopsLeft = loops == undefined ? 0 : loops;
                if(_loopsLeft >= 0) {
                    //_audio.pause();
                    _audio.currentTime = 0;
                    //_audio.load();
                    _audio.play();
                    _paused = false;
                    _playing = true;
                    options.onplay();
                }
            }
            catch(e) {
                alert("soundlib._HTML5Audio.play error: "+e.message);
            }
        }
        /*else if(0)
            setTimeout(function() { _me.play(loops); }, 1000);*/
    }

    this.stop = function() {
        try {
            _audio.pause();
            _audio.currentTime = 0;
            _paused = false;
            _playing = false;
            options.onstop();
        }
        catch(e) {
        }
    }

    this.pause = function() {
        try {
            _audio.pause();
            _paused = true;
            _playing = false;
            options.onpause();
        }
        catch(e) {
        }
    }

    this.resume = function() {
        try {
            _audio.play();
            _paused = false;
            _playing = true;
            options.onresume();
        }
        catch(e) {
        }
    }

    this.setVolume = function(volume) {
        try { _audio.volume = Math.max(0.0, Math.min(1.0, volume)); } catch(e) { }
    }

    this.getVolume = function() {
        try { return _audio.volume; } catch(e) { return 1.0; }
    }

    this.setPosition = function(seconds) {
        try { _audio.currentTime = Math.max(0.0, Math.min(_audio.duration, seconds)); } catch(e) { }
    }

    this.getPosition = function() {
        try { return _audio.currentTime; } catch(e) { return 0.0; }
    }

    this.getDuration = function() {
        try { return _audio.duration; } catch(e) { return 0.0; }
    }

    this.isPlaying = function() {
        return _playing;
    }
});




// =====================================================================


// creates a new sound
/* options:
    url: '',
    volume: 0.5,
    timeout: 10000,
    ontimeout: function() { },
    onfinish: function() { },
    onstop: function() { },
    onpause: function() { },
    onplay: function() { },
    onresume: function() { },
    oncanplaythrough: function() { },
    onerror: function() { }
*/
soundlib.createSound = function(options) {
    var _options = soundlib._merge(soundlib._defaultSoundOptions, options);

    //if(soundlib.canPlayURL(_options.url, "flash"))
    //    return new soundlib._SilentSound(_options); // TODO
    //else
    if(soundlib.canPlayURL(_options.url, "html5")) {
        if(soundlib._AudioContext)
            return new soundlib._AudioContextSound(_options);
        else
            return new soundlib._BuzzSound(_options); //return new soundlib._BuzzSound(_options);
    }
    else
        return new soundlib._SilentSound(_options);
};

// ready?
soundlib.onready = function(fun) {
    soundlib._ready = fun;
}

// time out?
soundlib.ontimeout = function(fun) {
    soundlib._timeout = fun;
}

// initialize
soundlib.init = function() {
    soundlib._ready(); // TODO SoundManager?
}



