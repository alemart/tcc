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

function DPU() {

    // logic unit
    function LU() { }
    LU.prototype.lcmp = function(a,b) { return (a ? 1 : 0) - (b ? 1 : 0); }
    LU.prototype.lor = function(a,b) { return a || b; }
    LU.prototype.land = function(a,b) { return a && b; }
    LU.prototype.lxor = function(a,b) { return (!a && b) || (a && !b); }
    LU.prototype.lnot = function(a) { return !a; }

    // floating point unit
    function FPU() { }
    FPU.prototype.fcmp = function(a,b) { return a - b; }
    FPU.prototype.fadd = function(a,b) { return a + b; }
    FPU.prototype.fsub = function(a,b) { return a - b; }
    FPU.prototype.fmul = function(a,b) { return a * b; }
    FPU.prototype.fdiv = function(a,b) { return b == 0 ? Infinity : a / b; }
    FPU.prototype.fmod = function(a,b) { return a - b * Math.floor( this.fdiv(a,b) ); }
    FPU.prototype.fneg = function(a) { return -a; }
    FPU.prototype.fint = function(a) { return Math.floor(a); }
    FPU.prototype.facos = function(a) { return Math.acos(a); }
    FPU.prototype.fasin = function(a) { return Math.asin(a); }
    FPU.prototype.fatan = function(a) { return Math.atan(a); }
    FPU.prototype.fceil = function(a) { return Math.ceil(a); }
    FPU.prototype.fcos = function(a) { return Math.cos(a); }
    FPU.prototype.fexp = function(a) { return Math.exp(a); }
    FPU.prototype.ffloor = function(a) { return Math.floor(a); }
    FPU.prototype.frnd = function() { return Math.random(); }
    FPU.prototype.flog = function(a) { return a >= 0 ? Math.log(a) : 0; } // base e
    FPU.prototype.fsin = function(a) { return Math.sin(a); }
    FPU.prototype.fsqrt = function(a) { return a >= 0 ? Math.sqrt(a) : 0; }
    FPU.prototype.ftan = function(a) { return Math.cos(a) == 0 ? (Math.sin(a) >= 0 ? 1 : -1) * Infinity : Math.tan(a); }
    FPU.prototype.fpow = function(a,b) { return Math.pow(a,b); }

    // trigonometric functions = in radians

    // string unit
    function SU() { }
    SU.prototype.scmp = function(a,b) { return (a == b) ? 0 : ((a < b) ? -1 : 1); }
    SU.prototype.slen = function(s) { return s.length; }
    SU.prototype.smid = function(s,i,j) {
        var start = Math.min(s.length, Math.max(i,0));
        var length = Math.min(s.length - start, Math.max(j,0));
        return s.substr(start, start + length);
    }
    SU.prototype.scat = function(a,b) { return ("" + a).concat("" + b); }
    SU.prototype.supr = function(s) { return ("" + s).toUpperCase(); }
    SU.prototype.slwr = function(s) { return ("" + s).toLowerCase(); }
    SU.prototype.sstr = function(s) { return "" + s; }
    SU.prototype.sval = function(s) { return parseFloat(s); }
    SU.prototype.sasc = function(s) { return (s + " ").charCodeAt(0); }
    SU.prototype.schr = function(s) { return String.fromCharCode(parseInt(s)); }

    // DPU: private members
    var _lu = new LU();
    var _fpu = new FPU();
    var _su = new SU();

    // DPU: public methods
    this.lu = function() { return _lu; }
    this.fpu = function() { return _fpu; }
    this.su = function() { return _su; }
}
