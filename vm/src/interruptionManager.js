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
function WindowInterrupt(io, media, tableManager, push, pop) {

    // TODO: replace with jQuery UI
    // warning! html tags...

    var task = pop();
    switch(task) {

    // message box
    case 0:
        alert(pop());
        break;

    // read data
    case 1: {
        var question = pop();
        var defaultAnswer = pop();
        var ans = prompt(question);
        push((ans != null && ans != undefined) ? ans : "");
        break;
    }

    // confirm box
    case 2:
        push(confirm(pop()) ? true : false);
        break;

    // invalid
    default:
        throw new Error("WindowInterrupt: invalid task: " + task);
        break;

    }
}

function PrinterInterrupt(io, media, tableManager, push, pop) {
    var task = pop();
    switch(task) {

    // print
    case 0:
        io.printer().print(pop());
        break;

    // invalid
    default:
        throw new Error("PrinterInterrupt: invalid task: " + task);
        break;

    }
}

function AudioInterrupt(io, media, tableManager, push, pop) {
    var task = pop();
    switch(task) {

    // create voice, given the filename
    case 0:
        push(media.audioData().createVoice(pop()));
        break;

    // delete voice, given the voice id
    case 1:
        media.audioData().destroyVoice(pop());
        break;

    // play sound
    case 2: {
        var voiceId = pop(); // voice id (not the voice object itself)
        var loops = pop();
        io.audio().play(media.audioData().getVoice(voiceId), loops);
        break;
    }

    // stop sound
    case 3:
        io.audio().stop(media.audioData().getVoice(pop()));
        break;

    // pause sound
    case 4:
        io.audio().pause(media.audioData().getVoice(pop()));
        break;

    // resume sound
    case 5:
        io.audio().resume(media.audioData().getVoice(pop()));
        break;

    // set position
    case 6: {
        var voiceId = pop();
        var seconds = pop();
        io.audio().setPosition(media.audioData().getVoice(voiceId), seconds);
        break;
    }

    // get position
    case 7:
        push(io.audio().getPosition(media.audioData().getVoice(pop())));
        break;

    // set volume
    case 8: {
        var voiceId = pop();
        var volume = pop();
        io.audio().setVolume(media.audioData().getVoice(voiceId), volume);
        break;
    }

    // get volume
    case 9:
        push(io.audio().getVolume(media.audioData().getVoice(pop())));
        break;

    // get duration
    case 10:
        push(io.audio().getDuration(media.audioData().getVoice(pop())));
        break;

    // is playing?
    case 11:
        push(io.audio().isPlaying(media.audioData().getVoice(pop())));
        break;

    // invalid
    default:
        throw new Error("AudioInterrupt: invalid task: " + task);
        break;
    }
}

function VideoInterrupt(io, media, tableManager, push, pop) {
    var task = pop();
    switch(task) {

    // canvas width
    case 0:
        push(io.video().canvasWidth());
        break;

    // canvas height
    case 1:
        push(io.video().canvasHeight());
        break;

    // set canvas size
    case 2:
        // TODO
        break;

    // set render target
    case 3:
        // TODO
        break;

    // enable double buffering
    case 4:
        io.video().enableDoubleBuffering();
        break;

    // flip
    case 5:
        io.video().flip();
        break;

    // clear screen
    case 6:
        io.video().cls();
        break;

    // set color (r,g,b)
    case 10: {
        var r = pop();
        var g = pop();
        var b = pop();
        io.video().setColor(r,g,b);
        break;
    }

    // set alpha
    case 11:
        io.video().setAlpha(pop());
        break;

    // rectfill
    case 12: {
        var x = pop();
        var y = pop();
        var w = pop();
        var h = pop();
        io.video().rectfill(x,y,w,h);
        break;
    }

    // rect
    case 13: {
        var x = pop();
        var y = pop();
        var w = pop();
        var h = pop();
        io.video().rect(x,y,w,h);
        break;
    }

    // circlefill
    case 14: {
        var x = pop();
        var y = pop();
        var r = pop();
        io.video().circlefill(x,y,r);
        break;
    }

    // circle
    case 15: {
        var x = pop();
        var y = pop();
        var r = pop();
        io.video().circle(x,y,r);
        break;
    }

    // line
    case 16: {
        var x1 = pop();
        var y1 = pop();
        var x2 = pop();
        var y2 = pop();
        io.video().line(x1,y1,x2,y2);
        break;
    }

    // textout
    case 17: {
        var fontName = pop();
        var fontSize = pop();
        var x = pop();
        var y = pop();
        var text = pop();
        io.video().textout(fontName, fontSize, x, y, text);
        break;
    }

    // draw image
    case 18: {
        var imageName = pop();
        var x = pop();
        var y = pop();
        io.video().drawImage(media.imageData().get(imageName), x, y);
        break;
    }

    // draw scaled image
    case 19: {
        var imageName = pop();
        var x = pop();
        var y = pop();
        var w = pop();
        var h = pop();
        io.video().drawScaledImage(media.imageData().get(imageName), x, y, w, h);
        break;
    }

    // draw clipped image (blit)
    case 20: {
        var imageName = pop(); // image identifier
        var sx = pop(); // source_rect x
        var sy = pop(); // source_rect y
        var sw = pop(); // source_rect width
        var sh = pop(); // source_rect height
        var x = pop(); // dest x
        var y = pop(); // dest y
        var w = pop(); // dest width
        var h = pop(); // dest height
        io.video().drawClippedImage(media.imageData().get(imageName), sx, sy, sw, sh, x, y, w, h);
        break;
    }

    // image width
    case 21:
        push(media.imageData().get(pop()).width);
        break;

    // image height
    case 22:
        push(media.imageData().get(pop()).height);
        break;

    // set transform: translation
    case 23: {
        var translationX = pop();
        var translationY = pop();
        io.video().setTranslation(translationX, translationY);
        break;
    }

    // set transform: scale
    case 24: {
        var scaleX = pop();
        var scaleY = pop();
        io.video().setScale(scaleX, scaleY);
        break;
    }

    // set transform: rotation
    case 25: {
        var rotationAngle = pop(); // clockwise, in radians
        io.video().setRotation(rotationAngle);
        break;
    }

    // set composite operation
    case 26: {
        var type = pop(); // source-over (default), lighter, xor, ...
        io.video().setCompositeOperation(type);
        break;
    }

    // invalid
    default:
        throw new Error("VideoInterrupt: invalid task: " + task);
        break;

    }
}

function MouseInterrupt(io, media, tableManager, push, pop) {
    var task = pop();
    switch(task) {

    // invalid
    default:
        throw new Error("MouseInterrupt: invalid task: " + task);
        break;

    }
}

function KeyboardInterrupt(io, media, tableManager, push, pop) {
    var task = pop();
    switch(task) {

    // invalid
    default:
        throw new Error("KeyboardInterrupt: invalid task: " + task);
        break;

    }
}

function MemoryInterrupt(io, media, tableManager, push, pop) {
    var task = pop();
    switch(task) {

    // does a table exist?
    case 0: {
        var table = pop();
        push(tableManager.tableExists(table));
        break;
    }

    // create table
    case 1: {
        push(tableManager.createTable());
        break;
    }

    // destroy table
    case 2: {
        var table = pop();
        tableManager.destroyTable(table);
        break;
    }

    // return table size
    case 3: {
        var table = pop();
        push(tableManager.tableSize(table));
        break;
    }

    // check if a given table entry exists
    case 4: {
        var table = pop();
        var key = pop();
        push(tableManager.tableEntryExists(table, key)); // true or false
        break;
    }

    // removes an entry from the table
    case 5: {
        var table = pop();
        var key = pop();
        push(tableManager.removeTableEntry(table, key)); // true (success) or false (otherwise)
        break;
    }

    // gets a table entry (or "" if it doesn't exist)
    case 6: {
        var table = pop();
        var key = pop();
        push(tableManager.getTableEntry(table, key));
        break;
    }

    // set table entry
    case 7: {
        var table = pop();
        var key = pop();
        var value = pop();
        tableManager.setTableEntry(table, key, value);
        break;
    }

    // clone a table
    case 8: {
        var table = pop();
        push(tableManager.cloneTable(table));
        break;
    }

    // get an iterator
    case 9: {
        var table = pop();
        push(tableManager.getTableIterator(table));
        break;
    }

    // is the iterator valid? 
    case 10: {
        var table = pop();
        var iterator = pop();
        push(tableManager.tableIteratorIsValid(table, iterator));
        break;
    }

    // increment the iterator
    case 11: {
        var table = pop();
        var iterator = pop();
        push(tableManager.incrementTableIterator(table, iterator)); // returns a new iterator value
        break;
    }

    // gets the key from the iterator
    case 12: {
        var table = pop();
        var iterator = pop();
        push(tableManager.getKeyFromTableIterator(table, iterator));
        break;
    }

    // gets the table entry from the it
    case 13: {
        var table = pop();
        var iterator = pop();
        push(tableManager.getValueFromTableIterator(table, iterator));
        break;
    }

    // invalid
    default:
        throw new Error("MemoryInterrupt: invalid task: " + task);
        break;
    }
}

// ===========================================
// Interruption Manager
// ===========================================
function InterruptionManager(registers, io, dataMemory) {

    // interruption vector
    var _fun = {
        3: MemoryInterrupt,
        4: WindowInterrupt,
        5: PrinterInterrupt,
        6: AudioInterrupt,
        7: VideoInterrupt,
        8: KeyboardInterrupt,
        9: MouseInterrupt
    }

    // pop data from stack (RAM)
    var _ram = dataMemory.ram();
    var _spId = registers.getCode("SP");
    var _pop = function() { return _ram.read(registers.write(_spId, registers.read(_spId) + 1)); }
    var _push = function(value) { return _ram.write(1 + registers.write(_spId, registers.read(_spId) - 1), value); }

    // public stuff
    this.run = function(interruptionCode) {
        if(typeof(_fun[interruptionCode]) == "function")
            _fun[interruptionCode](io, dataMemory.media(), dataMemory.tableManager(), _push, _pop);
        else
            throw new Error("Invalid interruption code: " + interruptionCode);
    }
}
