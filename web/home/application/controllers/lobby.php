<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Lobby extends CI_Controller
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

    // index
    public function index()
    {
        redirect(site_url('lobby/view'));
    }

    // list existing rooms
    public function view()
    {
        $this->load->view('lobby_view', array(
            'lobby' => true,
            'chat' => true,
            'chatroom_id' => Room_Model::LOBBY_ROOM_ID,
            'chatroom_name' => htmlspecialchars($this->Room_Model->getName(Room_Model::LOBBY_ROOM_ID)),
            'chatroom_lastmid' => intval($this->Room_Model->idOfTheLatestMessage(Room_Model::LOBBY_ROOM_ID)),
            'chatroom_nick' => htmlspecialchars($this->User_Model->getScreenName($this->_openid_identity)),
            'openid_identity' => htmlspecialchars($this->_openid_identity),
            'screenname' => htmlspecialchars($this->_screenname)
        ));
    }

    // create a new room ;-)
    public function create()
    {
        $name = trim($this->input->post("name"));
        $description = substr(trim($this->input->post("description")), 0, 1024);
        $rokey = $this->input->post("rokey");
        $rwkey = $this->input->post("rwkey");

        if($name == '' || $description == '') // shouldn't happen
            die("Required fields are blank.");

        $room_id = $this->Room_Model->createRoom($name, $description, $this->_openid_identity, $rokey, $rwkey);
        if(
            $this->Room_Model->joinRoom($room_id, $this->_openid_identity) &&
            $this->Room_Model->grantAllPrivilegesToUser($room_id, $this->_openid_identity)
        )
            redirect(site_url('room/index/'.intval($room_id)));
        else
            die("Can't join created room.");
    }

    // a json containing a list of active rooms
    public function lst()
    {
        // anti-XSS
        $lst = $this->Room_Model->getActiveRooms();
        foreach($lst as &$l) {
            foreach($l as &$el) {
                if(is_string($el))
                    $el = htmlspecialchars($el);
            }
        }

        // go
        $this->load->view('listrooms_view', array('l' => $lst));
    }
}

?>
