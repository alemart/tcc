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

function RAM(numberOfMemoryCells) {
    if(typeof(numberOfMemoryCells) != "number" || numberOfMemoryCells <= 0)
        throw new Error("Can't initialize the memory: invalid number of memory cells");

    var _mem = new Array(numberOfMemoryCells);
    /*var _read = function(addr) { return _mem[addr]; }
    var _write = function(addr, data) { return _mem[addr] = data; }*/

    // reset
    this.reset = function() {
        for(var i=0; i<_mem.length; i++)
            _mem[i] = 0;
    }
    this.reset();

    // read data from a given memory address
    this.read = function(addr) {
        /*if(typeof(addr) != "number")
            throw new Error("memread: weird memory access");
        else if(addr < 0 || addr >= _mem.length)
            throw new Error("memread: out of bounds error");

        return _read(addr);*/

        if(addr < 0 || addr >= numberOfMemoryCells)
            throw new Error("memread: out of bounds error");
        return _mem[addr];
    }

    // writes data to a given location
    this.write = function(addr, data) {
        /*if(typeof(addr) != "number" || (typeof(data) != "number" && typeof(data) != "string" && typeof(data) != "boolean"))
            throw new Error("memwrite: weird memory access");
        else if(addr < 0 || addr >= _mem.length)
            throw new Error("memwrite: out of bounds error");

        return _write(addr, data);*/

        if(addr < 0 || addr >= numberOfMemoryCells)
            throw new Error("memwrite: out of bounds error");
        return _mem[addr] = data;
    }

    // the number of memory cells
    this.capacity = function() {
        return numberOfMemoryCells;
    }
}
