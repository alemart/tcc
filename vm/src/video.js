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

// video device
function VideoDevice(ram) {
    // --------------------------------------
    // PRIVATE STUFF
    // --------------------------------------

    // who am i?
    var _me = this;

    // observer pattern: will call observer.notify(this video device, {msg: "something"})
    var _observerCollection = [];
    var _notifyObservers = function(args) {
        _observerCollection.forEach(function(item) { item.notify(_me, args); });
    }

    this.registerObserver = function(observer) {
        if(!(observer in _observerCollection))
            _observerCollection.push(observer);
    }

    // canvas
    var _frontBuffer = 0;
    var _canvas = function() { return document.getElementById('screen' + _frontBuffer); } //$("#screen" + _frontBuffer)[0]; }
    var _canvasContext = function() { return _canvas().getContext("2d"); }

    this.canvas = function() {
        return _canvas();
    }

    this.canvasContext = function() {
        return _canvasContext();
    }

    // the drawing strategy
    var _strategy = new SingleBufferedStrategy(this);

    // transformations
    var _transformData = { translationX: 0.0, translationY: 0.0, scaleX: 1.0, scaleY: 1.0, rotationAngle: 0.0 };
    var _setTransform = function(translationX, translationY, scaleX, scaleY, rotationAngle) {
        _transformData.translationX = parseFloat(translationX);
        _transformData.translationY = parseFloat(translationY);
        _transformData.scaleX = parseFloat(scaleX);
        _transformData.scaleY = parseFloat(scaleY);
        _transformData.rotationAngle = parseFloat(rotationAngle); // clockwise rotation angle, in radians

        var sx = _transformData.scaleX;
        var sy = _transformData.scaleY;
        var dx = _transformData.translationX;
        var dy = _transformData.translationY;
        var c = Math.cos(_transformData.rotationAngle);
        var s = Math.sin(_transformData.rotationAngle);

        _strategy.setTransform(sx*c, sy*s, -sx*s, sy*c, dx, dy); // yeah, I made the calculations...
    }

    // mouse cursor events
    $("#screen0, #screen1").mousemove(function(ev) {
        // get the (x,y) coordinate of a DOM element
        function getAbsolutePosition(elem) {
            var pos = {x: 0, y: 0};
            for(; elem; elem = elem.offsetParent) {
                pos.x += elem.offsetLeft;
                pos.y += elem.offsetTop;
            }
            return pos;
        }

        // where's the topleft of the screen?
        var topleft = getAbsolutePosition(this);
        var x = ev.pageX - topleft.x;
        var y = ev.pageY - topleft.y;
 
        // notify
        _notifyObservers({msg:"mousemove", xpos:x, ypos:y});
    }).mousedown(function(ev) {
        _notifyObservers({msg:"mousedown", button:ev.which});
    }).mouseup(function(ev) {
        _notifyObservers({msg:"mouseup", button:ev.which});
    });


    // --------------------------------------
    // PUBLIC INTERFACE
    // --------------------------------------

    // canvas size
    this.canvasWidth = function() {
        return _canvas().width;
    }

    this.canvasHeight = function() {
        return _canvas().height;
    }

    // colors
    this.setColor = function(r,g,b) {
        // 0 <= r, g, b <= 255
        _strategy.setRGB(r, g, b);
    }

    // alpha
    this.setAlpha = function(alpha) {
        // 0.0 (transparent) <= alpha <= 1.0 (opaque)
        _strategy.setAlpha(alpha);
    }

    // composite operation
    this.setCompositeOperation = function(type) {
        // type = source-over (default), lighter, xor, etc.
        _strategy.setCompositeOperation(type);
    }

    // transforms
    this.setTranslation = function(translationX, translationY) {
        _setTransform(translationX, translationY, _transformData.scaleX, _transformData.scaleY, _transformData.rotationAngle);
    }

    this.setScale = function(scaleX, scaleY) {
        _setTransform(_transformData.translationX, _transformData.translationY, scaleX, scaleY, _transformData.rotationAngle);
    }

    this.setRotation = function(rotationAngle) {
        _setTransform(_transformData.translationX, _transformData.translationY, _transformData.scaleX, _transformData.scaleY, rotationAngle);
    }

    // double buffering
    this.enableDoubleBuffering = function() {
        if(!_strategy.isDoubleBufferingEnabled()) {
            _canvas = function() { return document.getElementById('screen' + (1 - _frontBuffer)); } //return $("#screen" + (1 - _frontBuffer))[0]; } // _canvas() now returns the backbuffer
            _strategy = new DoubleBufferedStrategy(this);
            _notifyObservers({msg:"enabled double buffering"});
        }
    }

    this.disableDoubleBuffering = function() {
        if(_strategy.isDoubleBufferingEnabled()) {
            _canvas = function() { return document.getElementById('screen' + _frontBuffer); } //$("#screen" + _frontBuffer)[0]; }
            _strategy = new SingleBufferedStrategy(this);
            _notifyObservers({msg:"disabled double buffering"});
        }
    }

    this.isDoubleBufferingEnabled = function() {
        return _strategy.isDoubleBufferingEnabled();
    }

    this.flip = function() {
        if(_strategy.isDoubleBufferingEnabled()) {
            _notifyObservers({msg:"aboutToFlip"});
            _canvas().style.visibility = "visible";
            _frontBuffer = 1 - _frontBuffer;
            _canvas().style.visibility = "hidden";
            _notifyObservers({msg:"flipped"});
        }
    }

    // clears the screen
    this.cls = function() {
        _strategy.cls();
    }

    // image drawing
    this.drawImage = function(img, x, y) {
        _strategy.drawImage(img, x, y);
    }

    this.drawScaledImage = function(img, x, y, w, h) {
        _strategy.drawScaledImage(img, x, y, w, h);
    }

    this.drawClippedImage = function(img, sx, sy, sw, sh, x, y, w, h) {
        _strategy.drawClippedImage(img, sx, sy, sw, sh, x, y, w, h);
    }

    // text drawing
    this.textout = function(fontName, fontSize, x, y, text) {
        _strategy.textout(fontName, fontSize, x, y, text);
    }

    // primitive drawing
    this.rectfill = function(x, y, w, h) {
        _strategy.rectfill(x, y, w, h);
    }

    this.rect = function(x, y, w, h) {
        _strategy.rect(x, y, w, h);
    }

    this.circlefill = function(x, y, r) {
        _strategy.circlefill(x, y, r);
    }

    this.circle = function(x, y, r) {
        _strategy.circle(x, y, r);
    }

    this.line = function(x1, y1, x2, y2) {
        _strategy.line(x1, y1, x2, y2);
    }

    // resets the video device
    this.reset = function() {
        _me.disableDoubleBuffering();
        $("#screen0, #screen1").each(function(idx, element) {
            var ctx = element.getContext("2d");
            ctx.fillStyle = ctx.strokeStyle = "rgba(255,255,255,1)";
            ctx.setTransform(1,0,0,1,0,0);
            ctx.clearRect(0, 0, element.width, element.height);
            element.style.visibility = "hidden";
        });
        _frontBuffer = 0;
        _canvas().style.visibility = "visible";
    }

    // initializing...
    this.reset();
}

// depending if we're in double buffering mode or not,
// we should adopt a different drawing strategy


// single drawing strategy: no double buffering
function SingleBufferedStrategy(video) {
    var _canvas = video.canvas();
    var _ctx = video.canvasContext();

    // ----------------------------------------
    // PUBLIC METHODS
    // ----------------------------------------
    this.isDoubleBufferingEnabled = function() {
        return false;
    }

    this.cls = function() {
        _ctx.save();
        _ctx.setTransform(1, 0, 0, 1, 0, 0);
        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
        _ctx.restore();
    }

    this.setRGB = function(r, g, b) {
        var style = "rgb(" + r + "," + g + "," + b + ")";
        _ctx.fillStyle = _ctx.strokeStyle = style;
    }

    this.setAlpha = function(alpha) {
        _ctx.globalAlpha = alpha;
    }

    this.setTransform = function(a, b, c, d, e, f) {
        _ctx.setTransform(a, b, c, d, e, f);
    }

    this.drawImage = function(img, x, y) {
        _ctx.drawImage(img, x, y);
    }

    this.drawScaledImage = function(img, x, y, w, h) {
        _ctx.drawImage(img, x, y, w, h);
    }

    this.drawClippedImage = function(img, sx, sy, sw, sh, x, y, w, h) {
        _ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    }

    this.textout = function(fontName, fontSize, x, y, text) {
        _ctx.font = (fontSize + "pt ") + fontName;
        _ctx.textBaseline = "top";
        _ctx.fillText(text, x+0.5, y+0.5);
    }

    this.rectfill = function(x, y, w, h) {
        _ctx.beginPath();
        _ctx.rect(x+0.5, y+0.5, w, h);
        _ctx.closePath();
        _ctx.fill();
    }

    this.rect = function(x, y, w, h) {
        _ctx.beginPath();
        _ctx.rect(x+0.5, y+0.5, w, h);
        _ctx.closePath();
        _ctx.stroke();
    }

    this.circlefill = function(x, y, r) {
        _ctx.beginPath();
        _ctx.arc(x+0.5, y+0.5, r, 0, 2*Math.PI, true);
        _ctx.closePath();
        _ctx.fill();
    }

    this.circle = function(x, y, r) {
        _ctx.beginPath();
        _ctx.arc(x+0.5, y+0.5, r, 0, 2*Math.PI, true);
        _ctx.closePath();
        _ctx.stroke();
    }

    this.line = function(x1, y1, x2, y2) {
        _ctx.beginPath();
        _ctx.moveTo(x1+0.5, y1+0.5);
        _ctx.lineTo(x2+0.5, y2+0.5);
        _ctx.closePath();
        _ctx.stroke();
    }
}


// double buffered strategy
// the drawing optimizations are made in such a way that is somewhat similar to
// the Command pattern:
// http://en.wikipedia.org/wiki/Command_pattern
function DoubleBufferedStrategy(video) {

    // command list:
    // each element of the list is an object of the form:
    // {
    //     type: "fill|stroke|justDoIt",
    //     execute: a closure containing the entire command
    // }
    var _commandList = [];
    var _addCommand = function(commandType, fun) {
        _commandList.push({type: commandType, execute: fun});
    }
    var _runCommands = function(canvas, canvasContext) {
        // drawing sequence
        var drawingSequence = {
            "fill": {
                start: function() { canvasContext.beginPath(); },
                finish: function() { canvasContext.closePath(); canvasContext.fill(); }
            },
            "stroke": {
                start: function() { canvasContext.beginPath(); },
                finish: function() { canvasContext.closePath(); canvasContext.stroke(); }
            },
            "justDoIt": {
                start: function() { },
                finish: function() { }
            }
        }

        // start/finish drawing sequence
        var startDrawingSequence = function(type) {
            if(type in drawingSequence)
                drawingSequence[type].start();
        }
        var finishDrawingSequence = function(type) {
            if(type in drawingSequence)
                drawingSequence[type].finish();
        }

        // run the batch
        var drawEverything = function() {
            var prevType = "";
            var type = "";
        
            for(var key in _commandList) {
                var cmd = _commandList[key];
                type = cmd.type;
            
                if(type != prevType) {
                    finishDrawingSequence(prevType);
                    startDrawingSequence(type);
                }

                cmd.execute(canvas, canvasContext);
                prevType = type;
            }

            finishDrawingSequence(type);
        }

        // really execute the stuff
        drawEverything();
        _commandList = [];
    }

    // observer pattern
    video.registerObserver(this);
    this.notify = function(video, args) {
        if(args.msg == "aboutToFlip")
            _runCommands(video.canvas(), video.canvasContext());
    }

    // ----------------------------------------
    // PUBLIC METHODS
    // ----------------------------------------
    this.isDoubleBufferingEnabled = function() {
        return true;
    }

    this.cls = function() {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) {
                canvasContext.save();
                canvasContext.setTransform(1, 0, 0, 1, 0, 0);
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                canvasContext.restore();
            }
        );
    }

    this.setRGB = function(r, g, b) {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) {
                var style = "rgb(" + r + "," + g + "," + b + ")";
                canvasContext.fillStyle = style;
                canvasContext.strokeStyle = style;
            }
        );
    }

    this.setAlpha = function(alpha) {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) {
                canvasContext.globalAlpha = alpha;
            }
        );
    }

    this.setCompositeOperation = function(type) {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) {
                canvasContext.globalCompositeOperation = type;
            }
        );
    }

    this.setTransform = function(a, b, c, d, e, f) {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) { canvasContext.setTransform(a, b, c, d, e, f); }
        );
    }

    this.drawImage = function(img, x, y) {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) { canvasContext.drawImage(img, x, y); }
        );
    }

    this.drawScaledImage = function(img, x, y, w, h) {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) { canvasContext.drawImage(img, x, y, w, h); }
        );
    }

    this.drawClippedImage = function(img, sx, sy, sw, sh, x, y, w, h) {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) { canvasContext.drawImage(img, sx, sy, sw, sh, x, y, w, h); }
        );
    }

    this.textout = function(fontName, fontSize, x, y, text) {
        _addCommand(
            "justDoIt",
            function(canvas, canvasContext) {
                canvasContext.font = (fontSize + "pt ") + fontName;
                canvasContext.textBaseline = "top";
                canvasContext.fillText(text, x+0.5, y+0.5);
            }
        );
    }

    this.rectfill = function(x, y, w, h) {
        _addCommand(
            "fill",
            function(canvas, canvasContext) { canvasContext.rect(x+0.5, y+0.5, w, h); }
        );
    }

    this.rect = function(x, y, w, h) {
        _addCommand(
            "stroke",
            function(canvas, canvasContext) { canvasContext.rect(x+0.5, y+0.5, w, h); }
        );
    }

    this.circlefill = function(x, y, r) {
        _addCommand(
            "fill",
            function(canvas, canvasContext) { canvasContext.arc(x+0.5, y+0.5, r, 0, 2*Math.PI, true); }
        );
    }

    this.circle = function(x, y, r) {
        _addCommand(
            "stroke",
            function(canvas, canvasContext) { canvasContext.arc(x+0.5, y+0.5, r, 0, 2*Math.PI, true); }
        );
    }

    this.line = function(x1, y1, x2, y2) {
        _addCommand(
            "stroke",
            function(canvas, canvasContext) {
                canvasContext.moveTo(x1+0.5, y1+0.5);
                canvasContext.lineTo(x2+0.5, y2+0.5);
            }
        );
    }
}
