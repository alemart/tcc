<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Chat extends CI_Controller
{
    // user-data
    private $_screenname;
    private $_openid_identity;

    // constructor
    public function __construct()
    {
        parent::__construct();
        $this->utils->checkIfLoggedIn();
        $this->_screenname = $this->session->userdata('screenname');
        $this->_openid_identity = $this->session->userdata('openid_identity');
    }

    // join a room
    public function join($room_id)
    {
        $room_id = intval($room_id);
        if(!$this->Room_Model->isParticipant($room_id, $this->_openid_identity)) {
            if(!$this->Room_Model->hasReadOnlyKey($room_id)) {
                if(!$this->Room_Model->hasReadWriteKey($room_id))
                    $this->Room_Model->joinRoom($room_id, $this->_openid_identity);
            }
        }
        $this->Room_Model->keepRoomAlive($room_id);
    }

    // leave a room
    public function leave($room_id) {
        $room_id = intval($room_id);
        if($this->Room_Model->isParticipant($room_id, $this->_openid_identity))
            $this->Room_Model->leaveRoom($room_id, $this->_openid_identity);
        $this->Room_Model->keepRoomAlive($room_id);
    }

    // get list of messages (a json)
    public function receive($room_id)
    {
        // a little protection...
        $room_id = intval($room_id);
        $messages = $this->Room_Model->getMessages($room_id, $this->input->post('since'), $this->_openid_identity);
        foreach($messages as &$m) {
            foreach($m as &$value)
                $value = htmlspecialchars($value);
        }

        // more protection...
        $participants = $this->Room_Model->getParticipants($room_id);
        foreach($participants as &$p)
            $p = htmlspecialchars($p);

        // last id, so we can grab only the most recent messages later
        $last_id = intval($this->Room_Model->idOfTheLatestMessage($room_id));

        // done! ;-)
        $this->load->view('chatmessages_view', array(
            'last_id' => $last_id,
            'messages' => $messages,
            'participants' => $participants
        ));

        // bring me to life!
        $this->Room_Model->keepRoomAlive($room_id);
        $this->Room_Model->keepParticipantAlive($room_id, $this->_openid_identity);
    }

    // send a new message
    public function send($room_id)
    {
        $room_id = intval($room_id);
        $message = $this->input->post('message');
        if($message !== false)
            $this->Room_Model->addMessage($room_id, $this->_openid_identity, $message);

        // who knows...
        if(!$this->Room_Model->isParticipant($room_id, $this->_openid_identity))
            $this->Room_Model->joinRoom($room_id, $this->_openid_identity);

        // bring me to life!
        $this->Room_Model->keepRoomAlive($room_id);
        $this->Room_Model->keepParticipantAlive($room_id, $this->_openid_identity);
    }
}

?>
