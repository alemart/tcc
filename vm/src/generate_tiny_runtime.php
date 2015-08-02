<?php
require "jsmin.php";

$USE_CLOSURE_COMPILER = true;

$base = "./";
$srcs = array(
//  "jquery-1.5.min.js",
//  "soundmanager2-jsmin.js",
  "buzz.js",
//  "audia.js",
  "soundlib.js",

  "loadingScreen.js",

  "ram.js",
  "imageData.js",
  "audioData.js",
  "media.js",
  "tableManager.js",
  "dataMemory.js",

  "instruction.js",
  "instructionMemory.js",

  "printer.js",
  "video.js",
  "audio.js",
  "keyboard.js",
  "mouse.js",
  "io.js",

  "registers.js",
  "dpu.js",
  "interruptionManager.js",
  "controlUnit.js",
  "clock.js",
  "cpu.js",

  "runtimeEngine.js"
);

header("Content-type: text/javascript");
echo "/*!\n";
echo " * gameprototyper.com runtime engine\n";
echo " * http://gameprototyper.com/\n";
echo " * Copyright 2011, Alexandre Martins <alemartf(at)gmail(dot)com>\n";
echo " *\n";
echo " * Includes Buzz HTML5 Audio Library\n";
echo " * http://buzz.jaysalvat.com/\n";
echo " * Copyright 2011, Jay Salvat\n";
echo " * Buzz is released under the MIT license.\n";
/*
echo " *\n";
echo " * Includes Audia HTML5 Audio Library\n";
echo " * https://github.com/lostdecade/audia\n";
echo " * Copyright 2011, Matt Hacket (richtaur.com)\n";
echo " * Audia is released under the BSD license.\n";
*/
echo " */\n";
/* Includes jQuery JavaScript Library
 * http://jquery.com/
 * Copyright 2011, John Resig
 * jQuery is dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Sizzle.js is released under the MIT, BSD, and GPL Licenses.
 *
 *
 * Includes SoundManager 2
 * http://schillmania.com/projects/soundmanager2/
 * Copyright 2007, Scott Schiller
 * SoundManager 2 is licensed under the BSD License.
 *
window.SM2_DEFER=true;
*/

function pack_me($file)
{
    global $USE_CLOSURE_COMPILER;

    if($USE_CLOSURE_COMPILER && strpos($file, "jquery") === false && strpos($file, "soundmanager") === false) {
        $tmp = "/tmp/yui";
        system("java -jar closure-compiler/compiler.jar --js \"$file\" --js_output_file \"$tmp\"");
        return file_get_contents($tmp);
    }
    else
        return JSMin::minify(file_get_contents($file));
}

$c = count($srcs);
for($i=0; $i<$c; $i++) {
    $file = $base . ($srcs[$i]);
    if(file_exists($file))
        echo pack_me($file);
}

?>
