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

function ImageData() {
    // private stuff
    var _data = {};

    // release data
    this.release = function() {
        for(var x in _data)
            _data[x] = null;
        _data = {};
    }

    // loading images
    this.load = function(mediaList, statusCallback, onloadCallback) {
        _data = {};
        var _mediaListInitialLength = mediaList.length;
        var _loadMedia = function(mediaList) {
            // functional programming style ;)
            if(mediaList.length > 0) {
                var me = arguments.callee;
                var head = mediaList.shift();
                var id = ("" + head["id"]).toLowerCase();
                var url = head["url"];
                statusCallback({"file": id, "total": _mediaListInitialLength, "remaining": 1 + mediaList.length});

                _data[id] = new Image();
                _data[id].onabort = function() { throw new Error("Can't load media '" + id + "': interrupted"); };
                _data[id].onerror = function() { throw new Error("Can't load media '" + id + "': read error"); };
                _data[id].onload = function() { me(mediaList); };
                _data[id].src = url;
            }
            else
                onloadCallback();
        }

        // load media
        _loadMedia(mediaList);
    }

    // returns a javascr. Image object
    this.get = function(id) {
        id = ("" + id).toLowerCase();
        if(id in _data)
            return _data[id];
        else
            throw new Error("Can't find media '" + id + "'");
    }
}
