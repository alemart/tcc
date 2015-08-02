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

function RuntimeEngine(cyclesPerSecond, instructionsPerCycle, numberOfMemoryCells) {
    var _loadingScreen = new LoadingScreen();
    var _gameIsLoading = false;

    // components of the machine
    var _instructionMemory = null;
    var _dataMemory = null;
    var _io = null;
    var _cpu = null;

    // public stuff
    this.loadGame = function(game, onloadCallback) {
        var program = [];
        var title = "Noname";
        var media = {};

        // can't load the game if it's already being loaded
        if(_gameIsLoading)
            return;
        _gameIsLoading = true;

        // release stuff!
        if(_cpu != null) {
            _cpu.powerOff();
            delete _cpu;
            _cpu = null;
        }

        if(_instructionMemory != null) {
            delete _instructionMemory;
            _instructionMemory = null;
        }

        if(_dataMemory != null) {
            delete _dataMemory;
            _dataMemory = null;
        }

        if(_io != null) {
            delete _io;
            _io = null;
        }

        // validating the input
        if(game == undefined)
            throw new Error("Invalid game");

        program = game["program"];
        title = game["title"];
        media = game["media"];

        if(program == undefined)
            throw new Error("No program given");
        else if(program.length % 3 != 0)
            throw new Error("Invalid program length");
        
        // program name
        //document.title = title;

        // memory
        _instructionMemory = new InstructionMemory();
        _dataMemory = new DataMemory(numberOfMemoryCells);
        
        // loading the media
        _dataMemory.media().load(media, function(statusObject) {
            // while we're loading the media...
            _loadingScreen.display(statusObject["file"], 1.0 - statusObject["remaining"] / statusObject["total"]);
        }, function() {
            // after we load the media...
            _loadingScreen.display("", 1.0);

            // loading the instructions
            for(var i=0; i<program.length; i+=3)
                _instructionMemory.push(new Instruction(program[i+0], program[i+1], program[i+2]));
            _instructionMemory.push(new Instruction(1, 0, 0)); // halt

            // load the rest of the machine...
            _io = new IO(_dataMemory);
            _cpu = new CPU(cyclesPerSecond, instructionsPerCycle, _io, _instructionMemory, _dataMemory);

            // we're done! ;)
            setTimeout(function() {
                _loadingScreen.clear();
                _gameIsLoading = false;
                onloadCallback();
            }, 100);
        });
    }
    
    this.powerOn = function() {
        if(_cpu != null)
            _cpu.powerOn();
        else
            throw new Error("Please load the program");
    }
    
    this.powerOff = function() {
        if(_cpu != null) {
            _cpu.powerOff();
            _dataMemory.media().release();
        }
    }
}
