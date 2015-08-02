<?php
//
// Chinchilla Compiler Facade
// Copyright (C) 2011  Alexandre Martins <alemartf(at)gmail(dot)com>
//

//define('COMPILER_PATH', '../cgi-bin/');
define('COMPILER_PATH', 'http://gamewizard.cc/cgi-bin/');

// compile it
try {
    if(isset($_POST["code"])) {
        // compile the original source code
        $req = post_request(COMPILER_PATH.'ccc', array("code", $_POST["code"]));

        // check for compiling errors
        $response = substr($req["content"], strpos($req["content"], "\n\n") + 2);
        if(!preg_match("/^Chinchilla \d+(\.\d+)* OK\n\n/", $req["content"]))
            throw new ErrorException($response);
            throw new ErrorException($response);

        // calling the assembler
        $req = post_request(COMPILER_PATH.'ccasm', array("code", $response));

        // checking for assembly errors
        $response = substr($req["content"], strpos($req["content"], "\n\n") + 2);
        if(!preg_match("/^CCASM \d+(\.\d+)* OK\n\n/", $req["content"]))
            throw new ErrorException($response);

        // success!
        die(json_encode(array("status" => "ok", "data" => $response)));
    }
    else
        die('<html><head><title>FFFFFFFFFFFFUUUUUUUUUUUUUUUUUUU</title></head><body><img src="pic.jpg"></body></html>');
}
catch(ErrorException $e) {
    die(json_encode(array("status" => "error", "data" => $e->getMessage())));
}


// post_request()
// makes a POST request. $data is a (key,value) array
// by Jonas John (public domain) - http://www.jonasjohn.de/snippets/php/post-request.htm
// modified by Alexandre Martins
function post_request($url, $data, $referer='') {
 
    // Convert the data array into URL Parameters like a=b&foo=bar etc.
    $data = http_build_query($data);
 
    // parse the given URL
    $url = parse_url($url);
    if($url['scheme'] != 'http') { 
        throw new ErrorException('Error: only HTTP requests are supported!');
    }
 
    // extract host and path:
    $host = $url['host'];
    $path = $url['path'];

    // open a socket connection on port 80 - timeout: 30 sec
    $fp = fsockopen($host, 80, $errno, $errstr, 30);
    if($fp) {
        // send the request headers:
        fputs($fp, "POST $path HTTP/1.0\n");
        fputs($fp, "Host: $host\n");
 
        if($referer != '')
            fputs($fp, "Referer: $referer\n");
 
        fputs($fp, "Content-type: application/x-www-form-urlencoded\n");
        fputs($fp, "Content-length: ". strlen($data) ."\n");
        fputs($fp, "Connection: close\n\n");
        fputs($fp, $data);
 
        $result = ''; 
        while(!feof($fp)) {
            // receive the results of the request
            $result .= fgets($fp, 128);
        }
    }
    else
        throw new ErrorException("Error: can't open socket - $errstr ($errno)");
 
    // close the socket connection:
    fclose($fp);
 
    // split the result header from the content
/*    $result = explode("\r\n\r\n", $result, 2);
    $header = isset($result[0]) ? $result[0] : '';
    $content = isset($result[1]) ? $result[1] : '';*/
$content=$result;
 
    // return as structured array:
    return array(
        'status' => 'ok',
        'header' => $header,
        'content' => $content
    );
}

?>
