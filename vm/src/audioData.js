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

function AudioData() {
    // private stuff
    var _soundOf = {}; // hashmap: filename -> soundlib.Sound
    var _voiceAutoIncrement = 1;
    var _voice = { 0: null };
    var _soundlibLoaded = false;
    var _log = function(text) { alert(text); }; //$("#printer").text($("#printer").text() + "\n" + text); }

    // release data
    this.release = function() {
        for(var x in _voice) {
            if(_voice[x] != null) {
                _voice[x].destruct();
                delete _voice[x];
            }
        }
        for(var x in _soundOf) {
            if(_soundOf[x] != null) {
                _soundOf[x].destruct();
                delete _soundOf[x];
            }
        }
        _voiceAutoIncrement = 1;
        _voice = { 0: null };
        _soundOf = {};
    }

    // loading audio
    this.load = function(mediaList, statusCallback, onloadCallback) {
        // load stuff
        var _go = function() {
            var _mediaListInitialLength = mediaList.length;
            var _loadMedia = function(mediaList, unsupportedFiles) {
                // functional programming style ;)
                if(mediaList.length > 0) {
                    var me = arguments.callee;
                    var head = mediaList.shift();
                    var sid = ("" + head["id"]).toLowerCase();
                    var surl = head["url"];
                    var _proceed = function() { me(mediaList, unsupportedFiles); }; // load the next file
                    statusCallback({"file": sid, "total": _mediaListInitialLength, "remaining": 1 + mediaList.length});

                    // load sound (hopefully the browser will cache it)
                    if(soundlib.canPlayURL(surl)) {
                        _soundOf[sid] = soundlib.createSound({
                            url: surl,
                            timeout: 15000,
                            ontimeout: function() { _log("'" + sid + "' timed out!"); _proceed(); },
                            oncanplaythrough: function() { _proceed(); },
                            onerror: function() { _log("Error while loading media '" + sid + "'"); _proceed(); }
                        });
                    }
                    else {
                        unsupportedFiles.push(sid);
                        _proceed();
                    }
                }
                else {
                    // some files won't be played, unfortunately...
                    if(unsupportedFiles.length > 0) {
                        var s = "The following audio file" + (unsupportedFiles.length > 0 ? "s" : "") + " cannot be played by this browser:";

                        for(var i=0; i<unsupportedFiles.length; i++)
                            s += "\n* " + unsupportedFiles[i];

                        _log(s);
                    }

                    onloadCallback();
                }
            }

            // load media
            _loadMedia(mediaList, []);
        };

        // sound manager
        soundlib.html5Test = /^(probably|maybe)$/i;
        soundlib.onready(function() { _soundlibLoaded = true; _go(); });
        soundlib.ontimeout(function() { _soundlibLoaded = false; alert("Can't initialize audio."); onloadCallback(); });
        soundlib.init();
    }

    // given the voice id, returns a voice object
    this.getVoice = function(id) {
        id = parseInt(id);
        return (_soundlibLoaded && (id in _voice)) ? _voice[id] : null;
    }

    // spawns a new voice (and return its id), given a filename
    this.createVoice = function(filename) {
        if(_soundlibLoaded) {
            if(filename in _soundOf) {
                _voice[_voiceAutoIncrement] = _soundOf[filename].clone(); // <-- LEAKS??
                return _voiceAutoIncrement++;
            }
            else
                _log/*throw new Error*/("Can't create voice: media '" + filename + "' doesn't exist!");
        }

        return 0; // id of the null voice :)
    }

    // destroys an existing voice
    this.destroyVoice = function(id) {
        if(_soundlibLoaded && id != 0) {
            if(id in _voice) {
                _voice[id].destruct();
                delete _voice[id];
            }
        }
    }
}
