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

function CPU(cyclesPerSecond, instructionsPerCycle, io, instructionMemory, dataMemory) {
    var _dpu = new DPU();
    var _registers = new Registers();
    var _controlUnit = new ControlUnit(_registers, _dpu, io, instructionMemory, dataMemory);
    var _clock = new Clock(cyclesPerSecond, instructionsPerCycle, _controlUnit.fetchDecodeExecute, dataMemory.ram());

    io.video().registerObserver(_clock);

    this.dpu = function() { return _dpu; }
    this.registers = function() { return _registers; }
    this.controlUnit = function() { return _controlUnit; }
    this.clock = function() { return _clock; }

    // power on/off
    var _on = false;

    this.powerOn = function() {
        if(!_on) {
            _clock.start();
            _on = true;
        }
    }

    this.powerOff = function() {
        if(_on) {
            io.video().reset();
            _clock.stop();
            _registers.reset();
            _controlUnit.reset();
            instructionMemory.reset();
            dataMemory.reset();
            _on = false;
        }
    }

    this.isTurnedOn = function() {
        return _on;
    }
}
