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

function LoadingScreen()
{
    var _canvas = $("#screen0").get(0);
    var _ctx = _canvas.getContext("2d");

    this.display = function(currentFile, percentage) {
        percentage = Math.floor(100 * Math.max(Math.min(1.0, percentage), 0.0));
        $("#screen1").get(0).style.visibility = "hidden";
        _canvas.style.visibility = "visible";
        _ctx.save();

        // background
        _ctx.fillStyle = "#2B3856";
        _ctx.fillRect(0, 0, _canvas.width, _canvas.height);

        // "loading" text
        _ctx.fillStyle = "#fff";
        _ctx.font = "36px sans-serif";
        _ctx.textAlign = "center";
        _ctx.textBaseline = "bottom";
        _ctx.fillText("Now loading...", _canvas.width/2, _canvas.height/2);

        // percentage bar
        _ctx.fillStyle = "#000";
        _ctx.fillRect(_canvas.width/2-100, _canvas.height/2+20, 200, 30);
        var grad = _ctx.createLinearGradient(0, _canvas.height/2+20+1, 0, _canvas.height/2+20+1+30-2);
        grad.addColorStop(0, "#2b3856");
        grad.addColorStop(1, "#5E5A80");
        _ctx.fillStyle = grad;
        _ctx.fillRect(_canvas.width/2-100+1, _canvas.height/2+20+1, 2*percentage-2, 30-2);

        // percentage text
        _ctx.fillStyle = "#fff";
        _ctx.font = "18px sans-serif";
        _ctx.textAlign = "center";
        _ctx.textBaseline = "bottom";
        _ctx.fillText(percentage + "%", _canvas.width/2, _canvas.height/2 + 47);

        // current file
        _ctx.fillStyle = "#fff";
        _ctx.font = "11px sans-serif";
        _ctx.textAlign = "right";
        _ctx.textBaseline = "bottom";
        _ctx.fillText(currentFile, _canvas.width - 5, _canvas.height - 5);

        _ctx.restore();
    }

    this.clear = function() {
        //_canvas.style.visibility = "hidden";
        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    }
}
