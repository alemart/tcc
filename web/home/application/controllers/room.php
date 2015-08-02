<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Room extends CI_Controller
{
    // user-data
    private $_screenname;
    private $_openid_identity;

    // constructor
    public function __construct()
    {
        parent::__construct();

        // check if the user is logged in
        $this->utils->checkIfLoggedIn();

        // get the session data
        $this->_screenname = $this->session->userdata('screenname');
        $this->_openid_identity = $this->session->userdata('openid_identity');
    }

    // checks if the user belongs to this room
    private function _checkIfUserBelongsToRoom($room_id) {
        if(!$this->Room_Model->isParticipant($room_id, $this->_openid_identity)) {
            redirect(site_url('lobby/'));
            exit;
        }
    }

    // check if this is an invalid room
    private function _checkIfInvalidRoom($room_id) {
        if($room_id == Room_Model::LOBBY_ROOM_ID || !$this->Room_Model->roomExists($room_id)) {
            redirect(site_url('lobby/'));
            exit;
        }
    }

    // calls Mobwrite, the collaborative text-editor
    private function _callMobwrite($mw_input) {
        $this->load->library('mobwrite');
        return $this->mobwrite->execute($mw_input);
    }

    // calls the compiler
    private function _callCompiler($source_code) {
        // Submit a POST request to it.
        $host = $_SERVER['HTTP_HOST'];
        $res = '/cgi-bin/compiler';

        ini_set("display_errors", 0);        
        $fp = fsockopen($host, 80, $errno, $errstr, 5);
        ini_set("display_errors", 1);
        if(!$fp) return ""; // can't connect to $host:80

        $data = "code=".htmlentities(urlencode("$source_code\n\n"));
        $req  = "POST $res HTTP/1.0\r\n";
        $req .= "Host: $host\r\n";
        $req .= "Content-Length: ".strlen($data)."\r\n";
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
    }







    // index
    public function index($room_id)
    {
        redirect(site_url('room/develop/'.intval($room_id)));
    }

    // joins the room
    public function join($room_id)
    {
        // grab fields
        $room_id = intval($room_id);
        $user_key = $this->input->post("key");
        if($user_key === false)
            $user_key = '';

        if($room_id == Room_Model::LOBBY_ROOM_ID) {
            // can't join the lobby
            $response = "Already in the lobby.";
        }
        else if(!$this->Room_Model->roomExists($room_id)) {
            // room doesn't exist
            $response = "Invalid room.";
        }
        else if($this->Room_Model->isParticipant($room_id, $this->_openid_identity)) {
            // already in the room
            if(!$this->Room_Model->grantPrivilegesToUser($room_id, $this->_openid_identity, $user_key))
               $response = "Access denied. Can't change user privileges.";
            else
                $response = "ok";
        }
        else {
            // join the room
            if(!$this->Room_Model->joinRoom($room_id, $this->_openid_identity))
                $response = "Can't join the room.";
            else if(!$this->Room_Model->grantPrivilegesToUser($room_id, $this->_openid_identity, $user_key)) {
                $this->Room_Model->leaveRoom($room_id, $this->_openid_identity);
                $response = "Access denied.";
            }
            else
                $response = "ok";
        }

        $this->load->view('joinroom_view', array("response" => $response));
    }

    // leaves the room
    public function leave($room_id)
    {
        // security
        $room_id = intval($room_id);
        $this->_checkIfInvalidRoom($room_id);

        // leave
        if($this->Room_Model->isParticipant($room_id, $this->_openid_identity))
            $this->Room_Model->leaveRoom($room_id, $this->_openid_identity);

        redirect(site_url('lobby/'));
    }

    // game programming room
    public function develop($room_id)
    {
        // security checks
        $room_id = intval($room_id);
        $this->_checkIfInvalidRoom($room_id);
        $this->_checkIfUserBelongsToRoom($room_id);

        // my privileges
        $privileges = "";
        $privileges_humanreadable = "<script>alert('You have been disconnected.'); location.href='".site_url("lobby")."';</script>"; // gambiarra (user presses F5)

        if($this->Room_Model->userHasReadPrivileges($room_id, $this->_openid_identity)) {
            $privileges .= "R";
            $privileges_humanreadable = "Read-Only";
        }
        if($this->Room_Model->userHasWritePrivileges($room_id, $this->_openid_identity)) {
            $privileges .= "W";
            $privileges_humanreadable = "Read-Write";
        }
        if($this->Room_Model->userHasAdminPrivileges($room_id, $this->_openid_identity)) {
            $privileges .= "A";
            $privileges_humanreadable = "Administrator";
        }

        // load the view
        $this->load->library('AssetHelper');
        $this->load->view('room_view', array(
            'room' => true,
            'chat' => true,
            'chatroom_id' => $room_id,
            'chatroom_name' => htmlspecialchars($this->Room_Model->getName($room_id)),
            'chatroom_lastmid' => intval($this->Room_Model->idOfTheLatestMessage($room_id)),
            'chatroom_nick' => htmlspecialchars($this->User_Model->getScreenName($this->_openid_identity)),
            'openid_identity' => htmlspecialchars($this->_openid_identity),
            'screenname' => htmlspecialchars($this->_screenname),
            'privileges' => $privileges,
            'privileges_humanreadable' => $privileges_humanreadable,
            'assets_maxsize' => AssetHelper::MAX_SIZE,
            'assets_allowedtypes' => explode("|", AssetHelper::ALLOWED_TYPES),
            'updates_interval' => $this->utils->isRunningLocally() ? 250 : 1000 // in ms
        ));
    }

    // mobwrite's sync gateway: does all the authentication and stuff
    public function sync($room_id)
    {
        header('Content-type: text/plain');

        // security checks
        $room_id = intval($room_id);
        $this->_checkIfInvalidRoom($room_id);
        $this->_checkIfUserBelongsToRoom($room_id);

        // grab some data
        $mw_addr = $this->Room_Model->getMWAddress($room_id); // the filename I'll use
        $mw_input = $this->input->post('q'); // mobwrite gives me this
        if(strlen($mw_input) >= 65536) die("\n\n"); // malicious user?

        // In mobwrite's message from the client, we have a line like 'F:<number>:<filename>'
        // I want that <filename>
        $matches = array();
        preg_match('/(F|f):(\d+):([A-Za-z0-9\-_:.]+)(\r|\n|\r\n)/', $mw_input, $matches);
        if(count($matches) < 4) die("\n\n");
        $original_filename = $matches[3];

        // replace that <filename> by something more secret
        $mw_input = preg_replace('/(F|f):(\d+):([A-Za-z0-9\-_:.]+)(\r|\n|\r\n)/', "$1:$2:".$mw_addr."$4", $mw_input, 1);

        // If I don't have write privileges, I can't edit stuff
        if(!($this->Room_Model->userHasWritePrivileges($room_id, $this->_openid_identity))) {
            // the textarea should be read-only. If the client tries to hack something in
            // order to edit it anyway, it's likely that he or she will not be in sync
            // anymore due to (*)
            $mw_input = preg_replace('/[^rUuFfDd]:\d+:.*?(\r|\n|\r\n)/', '', $mw_input, -1);
            $mw_input = preg_replace('/[Dd]:\d+:.*?[+-].*?(\r|\n|\r\n)/', '', $mw_input, -1); // (*)
        }
//die($mw_input);
        // mobwrite gave me an output...
        $mw_output = $this->_callMobwrite($mw_input);

        // In mobwrite's message from the server, we have a line like 'f:<number>:<filename>'
        // Replace that <filename> by $original_filename
        $mw_output = preg_replace('/(F|f):(\d+):([A-Za-z0-9\-_:.]+)(\r|\n|\r\n)/', "$1:$2:".$original_filename."$4", $mw_output, 1);

        // and we're done!
        echo $mw_output;
    }

    // call the compiler
    public function compile($room_id)
    {
        header('Content-type: text/plain');

        // security checks
        $room_id = intval($room_id);
        $this->_checkIfInvalidRoom($room_id);
        $this->_checkIfUserBelongsToRoom($room_id);

        // compile it.
        $source_code = $this->input->post('code');
        $compiler_output = $this->_callCompiler($source_code);

        // done!
        echo $compiler_output;
    }
}

?>
