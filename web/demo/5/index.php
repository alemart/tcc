<!DOCTYPE html> 
<html lang="en"> 
 <head> 
  <meta charset="utf-8"> 
  <title>gamewizard.cc</title> 
  <style> 
  body { background-color: #fff; font-family: sans-serif; font-size: 12pt; color: #000; }
  a,a:link,a:visited,a:hover { text-decoration: underline; color: #777; }
  #space { width: 100%; }
  #inputArea { width: 50%; float: left; }
  #outputArea { width: 50%; float: right; }
  #printer { background-color: #ddf; width: 515px; border-left: 5px solid #aac; }
  canvas { background-color: #000; position: absolute; visibility: hidden; }
  </style> 
  <script src="gwruntime.js"></script> 
  <script>
var vm;
$(document).ready(function() {
try {
    vm = new RuntimeEngine(200, 30000, 65536);
    var g = {
        "title": "Hello!",
        "media": {
            "bar.png":            "http://gamewizard.cc/demo/5/bar.png",
            "ball.png":           "http://gamewizard.cc/demo/5/ball.png",
            "bg.jpg":             "http://gamewizard.cc/demo/5/bg.jpg",
            "hit.ogg":            "http://gamewizard.cc/demo/5/getogg.php?f=hit.ogg",
            "score.ogg":          "http://gamewizard.cc/demo/5/getogg.php?f=score.ogg",
            "music.ogg":          "http://gamewizard.cc/demo/5/getogg.php?f=music.ogg",
            "hit.mp3":            "http://gamewizard.cc/demo/5/hit.mp3",
            "score.mp3":          "http://gamewizard.cc/demo/5/score.mp3",
            "music.mp3":          "http://gamewizard.cc/demo/5/music.mp3",
        },
        "program": [1,0,0]
    };

    $("#compile").click(function() {
        var debug = $("#debug").is(":checked");
        vm.powerOff();
        $("#printer").text("Compilando...");
        $.post("../../cgi-bin/gwasm", { "code": $("#code").val(), "debug": debug ? "true" : "false" }, function(raw) {
            try {
                bin = $.parseJSON(raw);
                if(bin.status == "ok" && !debug) {
                    // compiler: success!
                    $("#printer").text("");
                    g.program = bin.data;
                    vm.loadGame(g, vm.powerOn);
                }
                else {
                    // compiler: error
                    $("#printer").text(bin.data);
                }
            }
            catch(e) {
                vm.powerOff();
                alert("FATAL ERROR\n\n" + e.message);
            }
        });
    });
}
catch(e) {
    vm.powerOff();
    alert("FATAL ERROR\n\n" + e.message);
}
});
  </script>

 </head> 
 <body> 
 
  <header> 
   <h2>Demo #5</h2> 
  </header> 
  <hr> 
 
  <section> 
   <p>Isto foi testado no Google Chrome, no Internet Explorer 9 e no Firefox 4. Clique em "Compilar" e aguarde.</p>
   <div id="space"> 
    <div id="inputArea"> 
     <form> 
      <input id="compile" type="button" value="Compilar"><br>
      <textarea id="code" rows="25" cols="60"><?php echo file_get_contents("code.txt"); ?></textarea><br>
      <input id="debug" type="checkbox"> <label for="debug">Apenas pré-processar?</label>
     </form> 
    </div> 
    <div id="outputArea"> 
     <pre id="printer"></pre>
     <canvas id="screen0" width="520" height="340">Oh no! Your browser doesn't support canvas!</canvas>
     <canvas id="screen1" width="520" height="340"></canvas>
    </div> 
   </div> 
   <br clear="all"><hr>
  </section> 
 
  <footer> 
   Data: 25/05/2011 - <a href="http://www.linux.ime.usp.br/~alemart">Alexandre Martins</a> - <a href="http://gamewizard.cc">gamewizard.cc</a> 
  </footer>  
 </body> 
</html> 
