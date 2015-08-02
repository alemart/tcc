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
  </style> 
  <script src="gwruntime.js"></script> 
  <script>
$(document).ready(function() {
    $("#compile").click(function() {
        $("#printer").text("Compilando...");
        $.post("../../cgi-bin/ccc6", { "code": $("#code").val() }, function(raw) {
            try {
                var header = raw.substr(0, raw.indexOf("\n\n"));
                var body = raw.substr(2 + raw.indexOf("\n\n"));

                if((/^Chinchilla \d.\d OK$/).test(header))
                    $("#printer").text(body);
                else {
                    $("#printer").text("");
                    alert(body);
                }
            }
            catch(e) {
                alert("FATAL ERROR\n\n" + e.message);
            }
        });
    });
});
  </script>

 </head> 
 <body> 
 
  <header> 
   <h2>Demo #6</h2> 
  </header> 
  <hr> 
 
  <section> 
   <p>Isto foi testado no Google Chrome, no Internet Explorer 9 e no Firefox 4. Clique em "Compilar" e aguarde.</p>
   <div id="space"> 
    <div id="inputArea"> 
     <form> 
      <input id="compile" type="button" value="Compilar"><br>
      <textarea id="code" rows="30" cols="60"><?php echo file_get_contents("code.txt"); ?></textarea><br>
     </form> 
    </div> 
    <div id="outputArea"> 
     <pre id="printer"></pre>
    </div> 
   </div> 
   <br clear="all"><hr>
  </section> 
 
  <footer> 
   Data: 06/07/2011 - <a href="http://www.linux.ime.usp.br/~alemart">Alexandre Martins</a> - <a href="http://gamewizard.cc">gamewizard.cc</a> 
  </footer>  
 
 </body> 
</html> 
