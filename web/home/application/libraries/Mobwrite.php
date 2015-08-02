<?php
if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Mobwrite
{
    // executes mobwrite, returning an answer
    public function execute($input)
    {
        $ci =& get_instance();
        if($ci->utils->isRunningLocally())
            return $this->_connectToDaemon($input);
        else
            return $this->_connectToGateway($input);
    }

    // I am the Mobwrite Gateway. Connect directly to the Mobwrite Daemon
    private function _connectToDaemon($input, $host = 'localhost', $port = 3017)
    {
        // this code is based on Mobwrite's PHP Gateway
        $output = "";
        ini_set("display_errors", 0);
        $fp = fsockopen($host, $port, $errno, $errstr, 5);
        ini_set("display_errors", 1);
        if(!$fp) {
            // PHP can't connect to Python daemon.
            $output = "\n\n";
        }
        else {
            if(get_magic_quotes_gpc()) {
                // Some servers have magic quotes enabled, some disabled.
                $input = stripslashes($input);
            }

            // talk to $host:$port via sockets
            fwrite($fp, $input);
            while(!feof($fp)) {
                $output .= fread($fp, 1024);
            }
            fclose($fp);
        }

        // output
        return "$output\n";
    }

    // sorry Mario, but the real Mobwrite Gateway is in another server!
    private function _connectToGateway($input, $url = 'http://mobwrite3.appspot.com/scripts/q.py')
    {
        // Submit a POST request to the URL.
        $matches = array();
        preg_match('/^\w+:\/\/(.*?)(\/.*)$/', $url, $matches);
        $host = $matches[1];
        $res = $matches[2];

        ini_set("display_errors", 0);        
        $fp = fsockopen($host, 80, $errno, $errstr, 5);
        ini_set("display_errors", 1);
        if(!$fp) return "\n"; // can't connect to $host:80

        $data = "q=".htmlentities(urlencode($input));
        $req  = "POST $res HTTP/1.1\r\n";
        $req .= "Host: $host\r\n";
        $req .= "User-Agent: gp/0\r\n";
        $req .= "Content-Type: application/x-www-form-urlencoded\r\n";
        $req .= "Content-Length: ".strlen($data)."\r\n";
        $req .= "Connection: close\r\n";
        $req .= "\r\n";
        $req .= $data;

        fwrite($fp, $req);
        for($output = ""; !feof($fp); $output .= fread($fp, 1024));
        fclose($fp);

        // done!
        $arr = explode("\r\n\r\n", $output, 2);
        if(count($arr) == 2) {
            list($headers, $body) = $arr;
        }
        else {
            $arr = explode("\n\n", $output, 2);
            if(count($arr) == 2)
                list($headers, $body) = $arr;
            else
                return $output;
        }
        return $body;

        /*
        //Internal Server Error?
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, array("q" => $input));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $output = curl_exec($ch);
        curl_close($ch);
        return $output
        */
    }
}

?>