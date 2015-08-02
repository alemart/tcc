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

function TableManager() {
    var _me = this;
    var _tableId = 0;
    var _tablePool = { };

    // reset all tables
    this.reset = function() {
        _tableId = 0;
        _tablePool = { };
    }

    // does a table exist?
    this.tableExists = function(table) {
        return _tablePool[table] != undefined;
    }

    // creates a new table
    this.createTable = function() {
        var table = "table#" + (_tableId++);
        _tablePool[table] = { };
        return table;
    }

    // destroys an existing table
    this.destroyTable = function(table) {
        if(_tablePool[table] == undefined)
            throw Error("Can't destroy table '" + table + "': invalid table!");

        _tablePool[table] = undefined;
    }

    // returns the number of elements in a table
    this.tableSize = function(table) {
        if(_tablePool[table] == undefined)
            throw Error("Can't check the table size of '" + table + "': invalid table!");

        var cnt = 0;
        for(var k in _tablePool[table])
            cnt++;

        return cnt;
    }

    // checks if a given table entry exists. returns true or false
    this.tableEntryExists = function(table, key) {
        if(_tablePool[table] == undefined)
            throw Error("Can't check if entry '" + key + "' of '" + table + "' exists: invalid table!");

        return ( _tablePool[table][key] != undefined );
    }

    // removes a given table entry. returns true on success, or false otherwise
    this.removeTableEntry = function(table, key) {
        if(_tablePool[table] == undefined)
            throw Error("Can't remove entry '" + key + "' of '" + table + "': invalid table!");

        if(_tablePool[table][key] != undefined) {
            obj = _tablePool[table];
            obj[key] = '<deleted>';
            delete obj[key];
            return true;
        }
        else
            return false;
    }

    // gets a table entry, or returns "" if it doesn't exist
    this.getTableEntry = function(table, key) {
        if(_tablePool[table] == undefined)
            throw Error("Can't get entry '" + key + "' of '" + table + "': invalid table!");

        if(_tablePool[table][key] != undefined)
            return _tablePool[table][key];
        else
            return "";
    }

    // sets an entry to the table
    this.setTableEntry = function(table, key, value) {
        if(_tablePool[table] == undefined)
            throw Error("Can't set entry '" + key + "' of '" + table + "' to '" + value + "': invalid table!");

        _tablePool[table][key] = value;
    }

    // clone a table
    this.cloneTable = function(table) {
        if(_tablePool[table] == undefined)
            throw Error("Can't clone table '" + table + "': invalid table!");

        var newTableName = _me.createTable();
        for(var key in _tablePool[table])
            _tablePool[newTableName][key] = _tablePool[table][key];

        return newTableName;
    }

    // ------- auxiliary functions made to traverse a table --------------

    // gets an iterator to the table
    this.getTableIterator = function(table) {
        if(_tablePool[table] == undefined)
            throw Error("Can't get iterator to table '" + table + "': invalid table!");

        var keys = [];
        for(var key in _tablePool[table])
            keys.push(key);

        return [keys, 0];
    }

    // is the table iterator valid?
    this.tableIteratorIsValid = function(table, iterator) {
        if(_tablePool[table] == undefined)
            throw Error("Can't check validity of iterator of table '" + table + "': invalid table!");
        else if(iterator.length != 2)
            throw Error("tableIteratorIsValid: not a table iterator");

        return iterator[1] >= 0 && iterator[1] < iterator[0].length;
    }

    // increments the iterator
    this.incrementTableIterator = function(table, iterator) {
        if(!_me.tableIteratorIsValid(table, iterator))
            throw Error("incrementTableIterator: Invalid table iterator");

        return [iterator[0], iterator[1] + 1];
    }

    // gets the key given the iterator
    this.getKeyFromTableIterator = function(table, iterator) {
         if(!_me.tableIteratorIsValid(table, iterator))
            throw Error("getKeyFromTableIterator: Invalid table iterator");

        return iterator[0][iterator[1]];
    }

    // gets the table entry given the iterator
    this.getValueFromTableIterator = function(table, iterator) {
         if(!_me.tableIteratorIsValid(table, iterator))
            throw Error("getValueFromTableIterator: Invalid table iterator");

        return _tablePool[table][iterator[0][iterator[1]]];
    }
}
