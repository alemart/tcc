<!DOCTYPE html> 
<html lang="en"> 
 <head> 
  <meta charset="utf-8"> 
  <title>DEMO</title> 
  <style> 
  body { background-color: #fff; font-family: sans-serif; font-size: 12pt; color: #000; }
  a,a:link,a:visited,a:hover { text-decoration: underline; color: #777; }
  #space { width: 100%; }
  #inputArea { width: 50%; float: left; }
  #outputArea { width: 50%; float: right; }
  #printer { background-color: #ddf; width: 515px; border-left: 5px solid #aac; }
  canvas { background-color: #000; position: absolute; visibility: hidden; }
  </style> 
  <script src="runtime.js"></script> 
  <script src="editarea/edit_area/edit_area_full.js"></script>
  <script>
editAreaLoader.init({id: "code", syntax: "chinchilla", start_highlight: true, replace_tab_by_spaces: 4, allow_toggle: false });

var vm;
$(document).ready(function() {
try {
    vm = new RuntimeEngine(200, 30000, 65536);
    var g = {
        "title": "Hello!",
        "media": {
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
   <h2>Demo #7</h2> 
  </header> 
  <hr> 
 
  <section> 
   <p>Isto foi testado no Google Chrome, no Internet Explorer 9 e no Firefox 4. Clique em "Compilar" e aguarde.</p>
   <div id="space"> 
    <div id="inputArea"> 
     <form> 
      <input id="compile" type="button" value="Compilar"><br>
      <textarea id="code" rows="25" cols="60"><?php echo file_get_contents("code.txt"); ?></textarea><br>
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
   Data: 20/07/2011 - <a href="http://www.linux.ime.usp.br/~alemart">Alexandre Martins</a> - DEMO
  </footer>  
 </body> 
</html> 
