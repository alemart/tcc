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

function ControlUnit(registers, dpu, io, instructionMemory, dataMemory) {
    // list of available instructions
    var _opcode = {
        "NOP":      0,  // No OPeration
        "HALT":     1,  // Terminates the execution of the program
        "MOVC":     2,  // move constant to register
        "MOVR":     3,  // move register to register
        "LOADC":    4,  // load data from a fixed memory location to a register
        "LOADR":    5,  // load data from a memory location pointed by a register to a register
        "STOREC":   6,  // store the content of a register to a fixed memory location
        "STORER":   7,  // store the content of a register to a memory location pointed by a register
        "JMPC":     8,  // jump to a fixed instruction number
        "JMPR":     9,  // jump to a instruction number pointed by a register
        "LCMPC":   10,  // logic comparsion: register to fixed value
        "LCMPR":   11,  // logic comparsion: register to register
        "FCMPC":   12,  // floating point comparsion: register to fixed value
        "FCMPR":   13,  // floating point comparsion: register to register
        "SCMPC":   14,  // string comparsion: register to fixed value
        "SCMPR":   15,  // string comparsion: register to register
        "JEC":     16,  // jump if equal
        "JNEC":    17,  // jump if not equal
        "JLC":     18,  // jump if lower
        "JLEC":    19,  // jump if lower or equal
        "JGC":     20,  // jump if greater
        "JGEC":    21,  // jump if greater or equal
        "JER":     22,  // jump if equal
        "JNER":    23,  // jump if not equal
        "JLR":     24,  // jump if lower
        "JLER":    25,  // jump if lower or equal
        "JGR":     26,  // jump if greater
        "JGER":    27,  // jump if greater or equal
        "PUSHC":   28,  // push constant value to the stack
        "PUSHR":   29,  // push register to the stack
        "POP":     30,  // pop value from the stack to a register
        "CALLC":   31,  // procedure call (fixed value)
        "CALLR":   32,  // procedure call (register)
        "RET":     33,  // return from procedure call
        "INTC":    34,  // interruption
        "INTR":    35,  // interruption
        "LORC":    36,  // logic OR
        "LORR":    37,  // logic OR
        "LANDC":   38,  // logic AND
        "LANDR":   39,  // logic AND
        "LXORC":   40,  // logic XOR
        "LXORR":   41,  // logic XOR
        "LNOT":    42,  // logic NOT
        "FADDC":   43,  // floating point ADD
        "FADDR":   44,  // floating point ADD
        "FSUBC":   45,  // floating point SUB
        "FSUBR":   46,  // floating point SUB
        "FMULC":   47,  // floating point MUL
        "FMULR":   48,  // floating point MUL
        "FDIVC":   49,  // floating point DIV
        "FDIVR":   50,  // floating point DIV
        "FMODC":   51,  // floating point MOD
        "FMODR":   52,  // floating point MOD
        "FNEG":    53,  // floating point NEG (neg(x) == -x)
        "FINT":    54,  // floating point INT
        "FACOS":   55,  // floating point ACOS
        "FASIN":   56,  // floating point ASIN
        "FATAN":   57,  // floating point ATAN
        "FCEIL":   58,  // floating point CEIL
        "FCOS":    59,  // floating point COS
        "FEXP":    60,  // floating point EXP
        "FFLOOR":  61,  // floating point FLOOR
        "FRND":    62,  // floating point RND (random)
        "FLOG":    63,  // floating point LOG (base e)
        "FSIN":    64,  // floating point SIN
        "FSQRT":   65,  // floating point SQRT
        "FTAN":    66,  // floating point TAN
        "SLEN":    67,  // string LEN
        "SLEFTC":  68,  // string LEFT
        "SLEFTR":  69,  // string LEFT
        "SRIGHTC": 70,  // string RIGHT
        "SRIGHTR": 71,  // string RIGHT
        "SCATC":   72,  // string CAT
        "SCATR":   73,  // string CAT
        "SUPR":    74,  // string UPR (convert to upper case)
        "SLWR":    75,  // string LWR (convert to lower case)
        "SSTR":    76,  // string STR (convert number to string)
        "SVAL":    77,  // string VAL (convert string to number)
        "FPOWC":   78,  // floating point POW
        "FPOWR":   79,  // floating point POW
        "TYPE":    80,  // typeof
        "SASC":    81,  // string ASC (get ascii code of a character)
        "SCHR":    82,  // string CHR (get character from an ascii code)

        "$": undefined  // -- end of list --
    }

    // --- OPTIMIZATIONS ---
    var _SP = registers.getCode("SP");
    var _BP = registers.getCode("BP");
    var _PC = registers.getCode("PC");
    var _CPF = registers.getCode("CPF");
    var _REGR = registers.read;
    var _REGW = registers.write;
    var _RAMR = dataMemory.ram().read;
    var _RAMW = dataMemory.ram().write;
    var _GETI = instructionMemory.get;
    var _LU = dpu.lu();
    var _FPU = dpu.fpu();
    var _SU = dpu.su();
    // --- OPTIMIZATIONS ---

    // has the program reached its end?
    var _terminated = false;

    // interruption manager
    var _intmgr = new InterruptionManager(registers, io, dataMemory);

    // hardware implementation for each opcode
    // the Control Unit does not do any hard work: it just delegates stuff
    var _hardwareImplementation = new Object();

    _hardwareImplementation[_opcode["NOP"]] = function(op1, op2) {
        ;
    }

    _hardwareImplementation[_opcode["HALT"]] = function(op1, op2) {
        _terminated = true;
    }

    _hardwareImplementation[_opcode["MOVC"]] = function(op1, op2) {
        _REGW(op1, op2);
    }

    _hardwareImplementation[_opcode["MOVR"]] = function(op1, op2) {
        _REGW(op1, _REGR(op2));
    }

    _hardwareImplementation[_opcode["LOADC"]] = function(op1, op2) {
        _REGW(op1, _RAMR(op2));
    }

    _hardwareImplementation[_opcode["LOADR"]] = function(op1, op2) {
        _REGW(op1, _RAMR(_REGR(op2)));
    }

    _hardwareImplementation[_opcode["STOREC"]] = function(op1, op2) {
        _RAMW(op2, _REGR(op1));
    }

    _hardwareImplementation[_opcode["STORER"]] = function(op1, op2) {
        _RAMW(_REGR(op2), _REGR(op1));
    }

    _hardwareImplementation[_opcode["LCMPC"]] = function(op1, op2) {
        _REGW(_CPF, _LU.lcmp(_REGR(op1), op2));
    }

    _hardwareImplementation[_opcode["LCMPR"]] = function(op1, op2) {
        _REGW(_CPF, _LU.lcmp(_REGR(op1), _REGR(op2)));
    }

    _hardwareImplementation[_opcode["FCMPC"]] = function(op1, op2) {
        _REGW(_CPF, _FPU.fcmp(_REGR(op1), op2));
    }

    _hardwareImplementation[_opcode["FCMPR"]] = function(op1, op2) {
        _REGW(_CPF, _FPU.fcmp(_REGR(op1), _REGR(op2)));
    }

    _hardwareImplementation[_opcode["SCMPC"]] = function(op1, op2) {
        _REGW(_CPF, _SU.scmp(_REGR(op1), op2));
    }

    _hardwareImplementation[_opcode["SCMPR"]] = function(op1, op2) {
        _REGW(_CPF, _SU.scmp(_REGR(op1), _REGR(op2)));
    }

    _hardwareImplementation[_opcode["JMPC"]] = function(op1, op2) {
        _REGW(_PC, op1);
    }

    _hardwareImplementation[_opcode["JMPR"]] = function(op1, op2) {
        _REGW(_PC, _REGR(op1));
    }

    _hardwareImplementation[_opcode["JEC"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) == 0 ? "JMPC" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JNEC"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) != 0 ? "JMPC" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JLC"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) < 0 ? "JMPC" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JLEC"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) <= 0 ? "JMPC" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JGC"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) > 0 ? "JMPC" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JGEC"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) >= 0 ? "JMPC" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JER"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) == 0 ? "JMPR" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JNER"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) != 0 ? "JMPR" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JLR"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) < 0 ? "JMPR" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JLER"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) <= 0 ? "JMPR" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JGR"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) > 0 ? "JMPR" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["JGER"]] = function(op1, op2) {
        _hardwareImplementation[_opcode[_REGR(_CPF) >= 0 ? "JMPR" : "NOP"]](op1, op2);
    }

    _hardwareImplementation[_opcode["PUSHC"]] = function(op1, op2) {
        _RAMW(1 + _REGW(_SP, _REGR(_SP) - 1), op1);
        //if(_REGR(_SP) > _REGR(_BP)) throw new Error("Stack overflow");
        // TODO: SP affects the user space?
    }

    _hardwareImplementation[_opcode["PUSHR"]] = function(op1, op2) {
        _RAMW(1 + _REGW(_SP, _REGR(_SP) - 1), _REGR(op1));
        //if(_REGR(_SP) > _REGR(_BP)) throw new Error("Stack overflow");
        // TODO: SP affects the user space?
    }

    _hardwareImplementation[_opcode["POP"]] = function(op1, op2) {
        _REGW(op1, _RAMR(_REGW(_SP, _REGR(_SP) + 1)));
        if(_REGR(_SP) > _REGR(_BP)) throw new Error("Stack overflow");
    }

    _hardwareImplementation[_opcode["CALLC"]] = function(op1, op2) {
        _hardwareImplementation[_opcode["PUSHR"]](_PC, 0);
        _hardwareImplementation[_opcode["JMPC"]](op1, 0);
    }

    _hardwareImplementation[_opcode["CALLR"]] = function(op1, op2) {
        _hardwareImplementation[_opcode["PUSHR"]](_PC, 0);
        _hardwareImplementation[_opcode["JMPR"]](op1, 0);
    }

    _hardwareImplementation[_opcode["RET"]] = function(op1, op2) {
        _hardwareImplementation[_opcode["POP"]](_PC, 0);
    }

    _hardwareImplementation[_opcode["INTC"]] = function(op1, op2) {
        _intmgr.run(op1);
    }
    
    _hardwareImplementation[_opcode["INTR"]] = function(op1, op2) {
        _intmgr.run(_REGR(op1));
    }
    
    _hardwareImplementation[_opcode["LORC"]] = function(op1, op2) {
        _REGW(op1, _LU.lor(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["LORR"]] = function(op1, op2) {
        _REGW(op1, _LU.lor(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["LANDC"]] = function(op1, op2) {
        _REGW(op1, _LU.land(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["LANDR"]] = function(op1, op2) {
        _REGW(op1, _LU.land(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["LXORC"]] = function(op1, op2) {
        _REGW(op1, _LU.lxor(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["LXORR"]] = function(op1, op2) {
        _REGW(op1, _LU.lxor(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["LNOT"]] = function(op1, op2) {
        _REGW(op1, _LU.lnot(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FADDC"]] = function(op1, op2) {
        _REGW(op1, _FPU.fadd(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["FADDR"]] = function(op1, op2) {
        _REGW(op1, _FPU.fadd(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["FSUBC"]] = function(op1, op2) {
        _REGW(op1, _FPU.fsub(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["FSUBR"]] = function(op1, op2) {
        _REGW(op1, _FPU.fsub(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["FMULC"]] = function(op1, op2) {
        _REGW(op1, _FPU.fmul(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["FMULR"]] = function(op1, op2) {
        _REGW(op1, _FPU.fmul(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["FDIVC"]] = function(op1, op2) {
        _REGW(op1, _FPU.fdiv(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["FDIVR"]] = function(op1, op2) {
        _REGW(op1, _FPU.fdiv(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["FMODC"]] = function(op1, op2) {
        _REGW(op1, _FPU.fmod(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["FMODR"]] = function(op1, op2) {
        _REGW(op1, _FPU.fmod(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["FNEG"]] = function(op1, op2) {
        _REGW(op1, _FPU.fneg(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FINT"]] = function(op1, op2) {
        _REGW(op1, _FPU.fint(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FACOS"]] = function(op1, op2) {
        _REGW(op1, _FPU.facos(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FASIN"]] = function(op1, op2) {
        _REGW(op1, _FPU.fasin(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FATAN"]] = function(op1, op2) {
        _REGW(op1, _FPU.fatan(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FCEIL"]] = function(op1, op2) {
        _REGW(op1, _FPU.fceil(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FCOS"]] = function(op1, op2) {
        _REGW(op1, _FPU.fcos(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FEXP"]] = function(op1, op2) {
        _REGW(op1, _FPU.fexp(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FFLOOR"]] = function(op1, op2) {
        _REGW(op1, _FPU.ffloor(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FRND"]] = function(op1, op2) {
        _REGW(op1, _FPU.frnd());
    }
    
    _hardwareImplementation[_opcode["FLOG"]] = function(op1, op2) {
        _REGW(op1, _FPU.flog(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FSIN"]] = function(op1, op2) {
        _REGW(op1, _FPU.fsin(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FSQRT"]] = function(op1, op2) {
        _REGW(op1, _FPU.fsqrt(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["FTAN"]] = function(op1, op2) {
        _REGW(op1, _FPU.ftan(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["SLEN"]] = function(op1, op2) {
        _REGW(op1, _SU.slen(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["SLEFTC"]] = function(op1, op2) {
        _REGW(op1, _SU.smid(_REGR(op1), 0, op2));
    }

    _hardwareImplementation[_opcode["SLEFTR"]] = function(op1, op2) {
        _REGW(op1, _SU.smid(_REGR(op1), 0, _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["SRIGHTC"]] = function(op1, op2) {
        _REGW(op1, _SU.smid(_REGR(op1), _REGR(op1).length - op2, op2));
    }
    
    _hardwareImplementation[_opcode["SRIGHTR"]] = function(op1, op2) {
        _REGW(op1, _SU.smid(_REGR(op1), _REGR(op1).length - _REGR(op2), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["SCATC"]] = function(op1, op2) {
        _REGW(op1, _SU.scat(_REGR(op1), op2));
    }

    _hardwareImplementation[_opcode["SCATR"]] = function(op1, op2) {
        _REGW(op1, _SU.scat(_REGR(op1), _REGR(op2)));
    }
    
    _hardwareImplementation[_opcode["SUPR"]] = function(op1, op2) {
        _REGW(op1, _SU.supr(_REGR(op1)));
    }
    
    _hardwareImplementation[_opcode["SLWR"]] = function(op1, op2) {
        _REGW(op1, _SU.slwr(_REGR(op1)));
    }

    _hardwareImplementation[_opcode["SSTR"]] = function(op1, op2) {
        _REGW(op1, _SU.sstr(_REGR(op1)));
    }

    _hardwareImplementation[_opcode["SVAL"]] = function(op1, op2) {
        _REGW(op1, _SU.sval(_REGR(op1)));
    }

    _hardwareImplementation[_opcode["FPOWC"]] = function(op1, op2) {
        _REGW(op1, _FPU.fpow(_REGR(op1), op2));
    }
    
    _hardwareImplementation[_opcode["FPOWR"]] = function(op1, op2) {
        _REGW(op1, _FPU.fpow(_REGR(op1), _REGR(op2)));
    }

    _hardwareImplementation[_opcode["TYPE"]] = function(op1, op2) {
        _REGW(op1, (typeof(_REGR(op1))).toLowerCase());
    }

    _hardwareImplementation[_opcode["SASC"]] = function(op1, op2) {
        _REGW(op1, _SU.sasc(_REGR(op1)));
    }

    _hardwareImplementation[_opcode["SCHR"]] = function(op1, op2) {
        _REGW(op1, _SU.schr(_REGR(op1)));
    }

    // public stuff
    this.reset = function() {
        _terminated = false;
        _REGW(_SP, dataMemory.ram().capacity() - 1);
        _REGW(_BP, dataMemory.ram().capacity() - 1);
        _REGW(_PC, 0);
    }

    this.programHasTerminated = function() {
        return _terminated;
    }

    this.getOpcode = function(instructionName) {
        if(typeof(instructionName) != "string" || _opcode[instructionName] == undefined)
            throw new Error("Illegal instruction");

        return _opcode[instructionName];
    }

    this.fetchDecodeExecute = function() {
        if(!_terminated) {
            var inst = _GETI(_REGR(_PC));
            var callback = _hardwareImplementation[inst.opcode];
            _REGW(_PC, _REGR(_PC) + 1);
            callback(inst.operand1, inst.operand2);
        }
    }
    
    // initializations
    this.reset();
}
