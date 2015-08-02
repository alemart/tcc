<!DOCTYPE html> 
<html lang="en"> 
 <head> 
  <meta charset="utf-8"> 
  <title>DEMO</title> 
  <style> 
  body { background-color: #048; font-family: sans-serif; font-size: 12pt; color: #fff; }
  a,a:link,a:visited,a:hover { text-decoration: underline; color: #777; }
  #codeArea { text-align: center; }
  #gameArea { display: none; }
  #printer { background-color: #000; width: 515px; border-left: 5px solid #ddd; }
  canvas { background-color: #000; position: absolute; visibility: hidden; }
  </style> 
  <link rel="stylesheet" href="simplemodal.css">
  <script src="jquery-1.6.2.min.js"></script> 
  <script src="jquery.simplemodal.1.4.1.min.js"></script> 
  <script src="editarea/edit_area/edit_area_full.js"></script>
  <script src="runtime.js"></script> 
  <script>
editAreaLoader.init({
    id: "code",
    syntax: "chinchilla",
    start_highlight: true,
    replace_tab_by_spaces: 4,
    allow_toggle: false
});

var vm;
$(document).ready(function() {
try {
    vm = new RuntimeEngine(200, 30000, 65536);
    var g = {
        "title": "Untitled Game",
        "media": {
            "sprite.png":             "http://gamewizard.cc/demo/8/sprite.png",
        },
        "program": [1,0,0]
    };

    $("#compile").click(function() {
        vm.powerOff();
        $("#printer").text("Compilando...");
        $.post("../../cgi-bin/compiler", { "code": editAreaLoader.getValue("code") }, function(raw) {
            try {
                bin = $.parseJSON(raw);
                if(bin.status == "ok") {
                    // compiler: success!
                    $("#printer").text("");
                    g.program = bin.data;
                    vm.loadGame(g, vm.powerOn);
                    $("#gameArea").modal({
                        onClose: function(dialog){
                            vm.powerOff();
                            $.modal.close();
                        },
                        minWidth: 820,
                        minHeight: 620,
                        opacity: 0,
                        escClose: false
                    });
                }
                else {
                    // compiler: error
                    alert(bin.data);
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
   <h2>Demo #8</h2> 
  </header> 
 
  <section> 
   <p>Isto foi testado no Google Chrome 11, no Internet Explorer 9 e no Firefox 4. Clique em "Compilar" e aguarde.</p>
   <div id="codeArea"> 
    <form> 
     <input id="compile" type="button" value="Compilar"><br>
     <textarea id="code" rows="30" cols="120"><?php echo file_get_contents("code.txt"); ?></textarea>
    </form> 
   </div> 
   <pre id="printer"></pre>
   <div id="gameArea"> 
    <canvas id="screen0" width="800" height="600">Oh no! Your browser doesn't support canvas!</canvas>
    <canvas id="screen1" width="800" height="600"></canvas>
   </div> 
  </section> 
 
  <footer> 
   Data: 03/08/2011 - <a href="http://www.linux.ime.usp.br/~alemart">Alexandre Martins</a> - DEMO
  </footer>  
 </body> 
</html> 
