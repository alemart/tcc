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

function DataMemory(numberOfMemoryCells) {
    var _ram = new RAM(numberOfMemoryCells);
    var _media = new Media();
    var _tableManager = new TableManager()

    this.ram = function() {
        return _ram;
    }

    this.media = function() {
        return _media;
    }

    this.tableManager = function() {
        return _tableManager;
    }

    this.reset = function() {
        _ram.reset();
        _tableManager.reset();
    }
}
