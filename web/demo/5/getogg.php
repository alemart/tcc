<?php
$f = basename($_GET["f"]);
if(file_exists("./$f")) {
    header("Content-Type: audio/ogg");
    header("Content-Length: ".filesize($f));
//    header("Expires: 0");
//    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
//    header("Pragma: no-cache");
    readfile($f);
}
?>
