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

function Media() {
    // private stuff
    var _images = [];
    var _audio = [];
    var _imageData = new ImageData();
    var _audioData = new AudioData();

    // accessors
    this.imageData = function() { return _imageData; };
    this.audioData = function() { return _audioData; };

    // release resources
    this.release = function() {
        _imageData.release();
        _audioData.release();
    }

    // load media
    this.load = function(mediaToBeLoaded, statusCallback, onloadCallback) {
        var len = 0;
        _images = [];
        _audio = [];

        // separating images and audio
        for(var key in mediaToBeLoaded) {
            var ext = key.substr(Math.max(0, key.lastIndexOf(".")));
            var imageHandler = function(id, url) { _images.push({"id": id, "url": url}); };
            var audioHandler = function(id, url) { _audio.push({"id": id, "url": url}); };
            var handler = {
                ".png": imageHandler,
                ".jpg": imageHandler,
                ".gif": imageHandler,
                ".ogg": audioHandler,
                ".mp3": audioHandler,
                ".mp4": audioHandler,
                ".wav": audioHandler,
                ".mid": audioHandler,
                ".rmi": audioHandler,
                ".webm": audioHandler,
                ".txt": function(key, media) { }
            };

            var fun = handler[ext.toLowerCase()];
            if(fun != undefined)
                fun(key, mediaToBeLoaded[key]);
            else
                throw new Error("Can't load media '" + key + "': unsupported file format '" + ext + "'");

            len++;
        }

        // let's load the media
        var _statusfunCount = 0;
        var _statusfun = function(statusData) {
            statusCallback({"file": statusData["file"], "total": len, "remaining": len - (_statusfunCount++)});
        }

        _imageData.load(_images, _statusfun, function() { _audioData.load(_audio, _statusfun, onloadCallback); });
    }
}
