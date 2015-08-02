<?php require("layout_begin.php"); ?>

<p>You have joined <strong><?=$chatroom_name?></strong> with <strong><?=$privileges_humanreadable?></strong> privileges. <a href="<?=site_url('room/leave/'.$chatroom_id)?>">Leave the room?</a></p>

<?php if(isset($chat)) require("chat_view.php"); ?>
<br>

<div id="assetPreview"></div>
<div id="assetUpload">
  <div>
    <p><strong>Please select a file:</strong></p>
    <input type="file" name="userfile" id="userfile">
    <p>Maximum size: <?=intval($assets_maxsize/(1024*1024))?> MB</p>
    <p>Accepted file types:<ul>
        <?php foreach($assets_allowedtypes as &$type) echo '<li>'.$type.'</li>'; ?>
    </ul></p>
  </div><div>
    <img src="<?=base_url()?>img/chat_loading.gif" alt="Loading">
  </div>
</div>
<div id="gameArea"> 
    <pre id="printer"></pre>
    <canvas id="screen0" width="640" height="480">Oh no! Your browser doesn't support canvas!</canvas>
    <canvas id="screen1" width="640" height="480"></canvas>
</div>
<div id="roomdev">
    <div id="roomdev_lwrap">
        <input type="hidden" id="roomdev_name" value="<?=$chatroom_name?>">
        <input type="hidden" id="roomdev_gw" value="../sync/<?=$chatroom_id?>">
        <input type="hidden" id="roomdev_cc" value="../compile/<?=$chatroom_id?>">
        <input type="hidden" id="roomdev_api" value="../../api">
        <input type="hidden" id="roomdev_asset" value="../../asset/?/<?=$chatroom_id?>">
        <input type="hidden" id="codemirror_path" value="<?=base_url()?>inc/cmui/">
        <div id="roomdev_codewrap">
            <textarea id="roomdev_code"></textarea>
        </div>
    </div>
    <div id="roomdev_rwrap">
        <div id="roomdev_buttonswrap">
          <table><tr><td>
            <button id="compile">Play now!</button>
          </td><td>
            <button id="export"><img alt="Export" src="<?=base_url()?>img/icons/disk.png"></button>
          </td></tr></table>
        </div>
        <div id="roomdev_apiwrap">
            <dl class="accordion">
                <dt>Quick Help</dt>
                <dd>
                    Click on any subject to expand. The format is like this:
                    <dl>
                        <dt>command</dt>
                        <dd>
                            A description of the command.
                            <pre>' and optionally,
' an example of use.</pre>
                        </dd>
                    </dl>
                </dd>
                <dt>The Language pt.1</dt>
                <dd>
                    <dl>
<dt>Hello, world!</dt>
<dd>
Your first program.
<pre>print "Hello!"</pre>
</dd>

<dt>Variables</dt>
<dd>
Variables hold texts, numbers or booleans.
<pre>name = "John"
phone = 12345678
married = false</pre>
</dd>

<dt>If-Then</dt>
<dd>
If the condition is true, do something.
<pre>if married then exit</pre>
Need more than one command?
<pre>if name = "John" then
    print "Hi, John."
    print "Meet Jane."
endif</pre>
</dd>

<dt>If-Then-Else</dt>
<dd>
If the condition is true, do something. If not, do something else.
<pre>if name &lt;&gt; "John" then
    print "Not John!"
else
    print "Hi, John."
endif</pre>
</dd>

<dt>Do-Loop</dt>
<dd>
Everything inside a do .. loop will loop forever, unless the break command is called.
<pre>do
    x = input("2+2=?")
    if x = 4 then break
loop</pre>
</dd>

<dt>While-Wend</dt>
<dd>
While the condition is true, do something.
<pre>x = 0
while x &lt;&gt; 4
    x = input("2+2=?")
wend</pre>
</dd>

<dt>For-Next</dt>
<dd>
Repeat with a counter.
<pre>' will count from 1 to 10
for i=1 to 10
    print i
next</pre>
There's also a more sophisticated version:
<pre>' odd numbers only
for i=1 to 10 step 2
    print i
next</pre>
</dd>

<dt>For-In-Next</dt>
<dd>
Iterate through a table.
<pre>phone = createTable()
phone["Alex"] = 1234
phone["Jane"] = 7890

print "My Agenda"
for key in phone
    print key + ": " + phone[key]
next

destroyTable phone</pre>
</dd>

<dt>break</dt>
<dd>
Will jump out of a loop.
<pre>
do
    break
    print "Won't appear"
loop</pre>
</dd>
                    </dl>
                </dd>
                <dt>The Language pt.2</dt>
                <dd>
                    <dl>
<dt>Comments</dt>
<dd>
Lines starting with an apostrophe are ignored.
<pre>' just for human readability...</pre>
</dd>

<dt>Arithmetic</dt>
<dd>
+, -, *, /, ^ (raise to a power), mod (division remainer) are your friends.
<pre>fifteen = 1 + 2 * 7
twentyone = (1 + 2) * 7
nine = 2 * 2^3 - 3.5 * 2
one = 7 mod 2</pre>
You can also modify variables like this:
<pre>t = 0
t += nine
t -= one
t /= 4
' t will be 2.</pre>
</dd>

<dt>Booleans</dt>
<dd>
and, or, not, xor are also your friends.
<pre>
a = 7 * one
if one=1 and a=7 then
    if not(nine&lt;9) then
        print "Correct"
    endif
endif
</pre>
</dd>

<dt>Comparing values</dt>
<dd>
=, &lt;&gt;, &lt;, &lt;=, &gt;, &gt;= will help you a lot.
<pre>
if lives &lt;= 0 then
    cls
    print "GAME OVER"
    exit
endif
</pre>
</dd>

<dt>Texts</dt>
<dd>
Texts can also be played with.
<pre>
name = "John"
name += " "
name += "Smith"
print name
</pre>
</dd>
                    </dl>
                </dd>
                <dt>The Language pt.3</dt>
                <dd>
                    <dl>
<dt>Functions</dt>
<dd>
Functions are pieces of code you can call anywhere.
<pre>
fun greet()
    setColor 0,255,0
    print "Hi."
endfun

greet ' calls greet
</pre>
Functions may also accept one or more parameters:
<pre>
fun greet(name, age)
    setColor 0, 255, 0
    print "Hi, " + name
    print "You're " + age
endfun

greet "Jane Doe", 7
</pre>
They may also return a value:
<pre>
fun isAdult(age)
    if age &gt;= 18 then
        return true
    else
        return false
    endif
endfun
</pre>
or, equivalently:
<pre>
fun isAdult?(age)
    return (age &gt;= 18)
endfun
</pre>
Use it like:
<pre>
age = input("Your age?")
if isAdult?(age) then
    print "An adult"
else
    print "Not an adult"
endif
</pre>
Important: whenever you call a function and expect a return value, use parenthesis!
<pre>
' CORRECT:
yes = isAdult?(18)

' CORRECT: no return
' values are expected.
greet "Kid", 7
</pre>
</dd>

<dt>Globals</dt>
<dd>
Any variable starting with a g_ prefix is global. It means that you'll be talking about the same variable anywhere in the code.
<pre>
g_name = "John"
name = "Jane"

fun test()
    g_name = "Smith"
    name = "Doe"
endfun

test ' calls test
print g_name ' Smith
print name ' Jane
</pre>
</dd>
                    </dl>
                </dd>
                <dt>The Language pt.4</dt>
                <dd>
                    <dl>
<dt>Main Loop</dt>
<dd>
Every game that is not text-based, i.e., that has movement and/or animations, should have the following structure:
<pre>
gameMode
do
    cls
    &lt;game logic&gt;
    &lt;render calls&gt;
    flip
loop
</pre>
See "Video routines" for more details. Example:
<pre>
' moving a ball at
' a constant speed
gameMode
do
    cls

    x += 10
    y = 240
    r = 20

    circlefill x, y, r

    flip
loop
</pre>
</dd>
                    </dl>
                </dd>
                <dt>Keycodes</dt>
                <dd>
<p>List of all key codes. See &quot;Keyboard routines&quot; for more information.</p>
<dl><dt>Keycodes</dt><dd>
<pre>
g_keyBackspace = 8
g_keyTab = 9
g_keyClear = 12
g_keyReturn = 13
g_keyEnter = 13
g_keyPause = 19
g_keyCapsLock = 20
g_keyEscape = 27
g_keySpace = 32
g_keyPageUp = 33
g_keyPageDown = 34
g_keyEnd = 35
g_keyHome = 36
g_keyLeft = 37
g_keyUp = 38
g_keyRight = 39
g_keyDown = 40
g_keySelect = 41
g_keyPrint = 42
g_keyExecute = 43
g_keyScreen = 44
g_keyInsert = 45
g_keyDelete = 46
g_keyHelp = 47
g_key0 = 48
g_key1 = 49
g_key2 = 50
g_key3 = 51
g_key4 = 52
g_key5 = 53
g_key6 = 54
g_key7 = 55
g_key8 = 56
g_key9 = 57
g_keyA = 65
g_keyB = 66
g_keyC = 67
g_keyD = 68
g_keyE = 69
g_keyF = 70
g_keyG = 71
g_keyH = 72
g_keyI = 73
g_keyJ = 74
g_keyK = 75
g_keyL = 76
g_keyM = 77
g_keyN = 78
g_keyO = 79
g_keyP = 80
g_keyQ = 81
g_keyR = 82
g_keyS = 83
g_keyT = 84
g_keyU = 85
g_keyV = 86
g_keyW = 87
g_keyX = 88
g_keyY = 89
g_keyZ = 90
g_keyLeftSys = 91
g_keyRightSys = 92
g_keyNumpad0 = 96
g_keyNumpad1 = 97
g_keyNumpad2 = 98
g_keyNumpad3 = 99
g_keyNumpad4 = 100
g_keyNumpad5 = 101
g_keyNumpad6 = 102
g_keyNumpad7 = 103
g_keyNumpad8 = 104
g_keyNumpad9 = 105
g_keyNumpadMultiply = 106
g_keyNumpadAdd = 107
g_keyNumpadSubtract = 109
g_keyNumpadDecimal = 110
g_keyNumpadDivide = 111
g_keyF1 = 112
g_keyF2 = 113
g_keyF3 = 114
g_keyF4 = 115
g_keyF5 = 116
g_keyF6 = 117
g_keyF7 = 118
g_keyF8 = 119
g_keyF9 = 120
g_keyF10 = 121
g_keyF11 = 122
g_keyF12 = 123
g_keyNumLock = 144
g_keyScrollLock = 145
g_keyLeftShift = 160
g_keyRightShift = 161
g_keyLeftControl = 162
g_keyRightControl = 163
g_keyLeftAlt = 164
g_keyRightAlt = 165
g_keyTilde = 192
g_keyMinus = 107
g_keyEquals = 109
g_keyOpenBracket = 219
g_keyCloseBracket = 221
g_keyBackslash = 226
g_keySemiColon = 186
g_keyQuote = 222
g_keyComma = 188
g_keyPeriod = 190
g_keySlash = 191
</pre>
</dd></dl>
                </dd>
            </dl>
            <img src="<?=base_url()?>img/chat_loading.gif" alt="Loading">
        </div>
        <div id="roomdev_assetswrap">
            <p><strong>Free space:</strong> <span id="freediskspace"></span></p>
            <div id="assetbrowserwrap">
                <ul id="assetbrowser" class="filetree">
                    <li id="gfx"><span class="folder">Images</span></li>
                    <li id="snd"><span class="folder">Audio</span></li>
                    <li id="misc"><span class="folder">Other</span></li>
                </ul>
            </div>
            <button id="upload">Upload asset</button>
        </div>
    </div>
    <br clear="all">
</div>

<script>
$('#roomdev_code').get(0).readOnly = <?=($privileges == 'R') ? 'true' : 'false'?>;
mobwrite.syncGateway = $('#roomdev_gw').val();
<?=isset($updates_interval) ? 'mobwrite.minSyncInterval = mobwrite.maxSyncInterval = mobwrite.syncInterval = '.intval($updates_interval).';' : ''?>

var createUI = function() { return mobwrite.shareCodeMirrorUI.create('roomdev_code', {
    // ui options
    path: $('#codemirror_path').val() + 'js/',
    searchMode: 'popup',
    buttons: $('#roomdev_code').get(0).readOnly ? ['jump'] : ['search', 'undo', 'redo', 'jump']
}, {
    // codemirror options
    mode: 'chinchilla',
    lineNumbers: true,
    readOnly: $('#roomdev_code').get(0).readOnly ? 'nocursor' : false,
    indentUnit: 4,
    tabMode: 'shift',
    enterMode: 'flat',
    workTime: 200,
    workDelay: 300
}); };
var ui = createUI();
var cursor = {line: 0, ch: 0};

function pauseEditor() { cursor = ui.mirror.getCursor(); mobwrite.syncRun1_(); mobwrite.unshare(ui); ui.toTextArea(); mobwrite.share('roomdev_code'); ui = null; }
function resumeEditor() { mobwrite.unshare('roomdev_code'); ui = createUI(); ui.mirror.setCursor(cursor); mobwrite.share(ui); }
function getClientText() { return ui.mirror.getValue(); }

$(function() { mobwrite.share(ui); });
</script>
<?php require("layout_end.php"); ?>
