<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Room_Model extends CI_Model
{
    // constants
    const LOBBY_ROOM_ID = 1;

    // permission flags
    const PERMISSION_ADMIN = 1;
    const PERMISSION_WRITE = 2;
    const PERMISSION_READ = 4;

    // constructor
    public function __construct()
    {
        parent::__construct();
        $this->load->library('AssetHelper');
        $interval = "50 minute";

        // kick inactive users from all rooms
        $this->db->query(
            "delete from user_participates_room where ".
            "date_add(last_activity, interval $interval) < utc_timestamp()"
        );

        // delete messages from old rooms
        $this->db->query(
            "delete from messages where room in ".
            "(select id from rooms where date_add(last_activity, interval $interval) < utc_timestamp())"
        );

        // delete old rooms
        $q = $this->db->query( // the lobby room must never be deleted
            "select id from rooms where permanent = false and id <> ? and date_add(last_activity, interval $interval) < utc_timestamp()",
            array(self::LOBBY_ROOM_ID)
        );
        if($q->num_rows() > 0) {
            for($i=0; $i<$q->num_rows(); $i++) {
                $room_id = $q->row($i)->id;
                $this->assethelper->purgeFiles($room_id);
                $this->db->query("delete from rooms where id=?", array($room_id));
            }
        }
    }

    // ====== ROOMS AND CHAT ==========

    // creates a new room. Returns its id
    public function createRoom($name, $description, $owner_openid, $readonly_key = '', $readwrite_key = '')
    {
        $mw_addr = uniqid('mw_');
        $ro_key = ($readonly_key == '') ? '' : md5($readonly_key);
        $rw_key = ($readwrite_key == '') ? '' : md5($readwrite_key);

        $q = $this->db->query(
                "insert into rooms values(null, ?, ?, utc_timestamp(), utc_timestamp(), ?, ?, ?, (select id from users where openid_identity = ?), false)",
                array($name, $description, $ro_key, $rw_key, $mw_addr, $owner_openid)
             );

        if($q) {
            //$q = $this->db->query("select last_insert_id() as id"); // risky due to concurrency?
            $sn = $this->db->escape($name);
            $q = $this->db->query("select id from rooms where name=$sn order by id desc limit 1");
            if($q)
                return $q->row(0)->id;
        }

        die("Can't create room '".htmlspecialchars($name)."'");
    }

    // does the given room exist?
    public function roomExists($room_id)
    {
        $q = $this->db->query("select count(name) as c from rooms where id = ?", array($room_id));
        return $q->num_rows() > 0 && $q->row(0)->c > 0;
    }

    // gets the room name given its id
    public function getName($room_id)
    {
        $q = $this->db->query("select name from rooms where id=?", array($room_id));
        return $q->num_rows() > 0 ? $q->row(0)->name : "null";
    }

    // gets the openid of who created this room
    public function getOwnerOpenID($room_id)
    {
        $q = $this->db->query("select openid_identity from users where id=(select owner from rooms where id=?)", array($room_id));
        return $q->num_rows() > 0 ? $q->row(0)->openid_identity : "null";
    }

    // makes an user join a room. true on success, false otherwise
    public function joinRoom($room_id, $user_openid_identity)
    {
        return $this->db->query(
                "insert into user_participates_room values(null, ".
                "(select id from users where openid_identity = ? limit 1), ".
                "?, utc_timestamp(), utc_timestamp(), 0)",
                array($user_openid_identity, $room_id)
               );
    }

    // makes an user leave a room
    public function leaveRoom($room_id, $user_openid_identity)
    {
        return $this->db->query(
                "delete from user_participates_room where room = ? and ".
                "user = (select id from users where openid_identity = ? limit 1)",
                array($room_id, $user_openid_identity)
               );
    }

    // get an array containing an array of participants
    // (in fact, we get their screennames)
    public function getParticipants($room_id)
    {
        $arr = array();
        $q = $this->db->query(
                "select users.screenname as screenname from user_participates_room ".
                "inner join users on user_participates_room.user = users.id where ".
                "user_participates_room.room = ?",
                array($room_id)
             );

        $len = $q->num_rows();
        for($i=0; $i<$len; $i++) {
            $row = $q->row($i);
            $arr[] = $row->screenname;
        }

        return $arr;
    }

    // checks if a given user is inside a room
    public function isParticipant($room_id, $user_openid_identity)
    {
        $q = $this->db->query(
                "select count(id) as c from user_participates_room where ".
                "room = ? and user = (select id from users where openid_identity = ?)",
                array($room_id, $user_openid_identity)
             );

        return intval($q->row(0)->c) > 0;
    }

    // returns an array of associative arrays containing messages from a given room
    // eg: [ {s: "sender", m:"hello!", i: id}, ... ]
    public function getMessages($room_id, $since_message_id = false, $exclude_user_openid = '')
    {
        $safe_id = $this->db->escape($room_id);
        $safe_mid = $this->db->escape($since_message_id);
        $safe_euo = $this->db->escape($exclude_user_openid);
        $get_all = $since_message_id === false;

        $q = $this->db->query(
                "select users.screenname as sender, messages.message as message, ".
                "messages.id as id from messages inner join users ".
                "on messages.user = users.id where messages.room = $safe_id ".
                ($get_all ? "" : "and messages.id > $safe_mid ").
                ($exclude_user_openid <> "" ? "and users.openid_identity <> $safe_euo " : "").
                "order by id asc"
             );

        $arr = array();
        $len = $q->num_rows();
        for($i=0; $i<$len; $i++) {
            $row = $q->row($i);
            $arr[] = array(
                "s" => $row->sender,
                "m" => $row->message
            );
        }

        return $arr;
    }

    // adds a chat message to a room. true on success, false otherwise
    public function addMessage($room_id, $user_openid_identity, $message)
    {
        return $this->db->query(
                "insert into messages values(null, ?, ".
                "(select id from users where openid_identity = ? limit 1), ".
                "utc_timestamp(), ?)",
                array($room_id, $user_openid_identity, $message)
               );
    }

    // the last, the greatest id value from a message
    public function idOfTheLatestMessage($room_id)
    {
        $safe_id = $this->db->escape($room_id);
        $q = $this->db->query("select id from messages where room=$safe_id order by id desc");
        return $q->num_rows() > 0 ? intval($q->row(0)->id) : 0;
    }

    // makes the user leave all chat rooms (useful when -> logout)
    public function leaveAllRooms($user_openid_identity)
    {
        return $this->db->query(
                "delete from user_participates_room where user in ".
                "(select id from users where openid_identity = ?)",
                array($user_openid_identity)
               );
    }

    // gets a collection of active rooms. Each cell of the array is of the form:
    // "name" => <string>,
    // "description" => <string>,
    // "owner" => <string>,
    // "uptime" => <string>,
    // "num_users" => <integer>,
    // "got_rw_key" => true|false,
    // "got_ro_key" => true|false,
    // "permanent" => true|false
    public function getActiveRooms()
    {
        $l = array();
        $q = $this->db->query(
                "select rooms.name as name, rooms.description as description, rooms.creation_date as ".
                "creation_date, (select count(*) from user_participates_room where room = rooms.id) as ".
                "num_users, (rooms.rw_key <> '') as got_rw_key, (rooms.ro_key <> '') as got_ro_key, ".
                "rooms.id as id, utc_timestamp() as _now, rooms.permanent as permanent, ".
                "(select users.screenname from users where users.id = rooms.owner) as owner ".
                "from rooms where rooms.id <> ? order by rooms.permanent desc, rooms.id desc",
                array(self::LOBBY_ROOM_ID)
             );

        $len = $q->num_rows();
        for($i=0; $i<$len; $i++) {
            $r = $q->row($i);

            // empty room?
            //if(intval($r->num_users) <= 0)
            //    continue;

            // time difference
            $dt = strtotime($r->_now) - strtotime($r->creation_date); // total difference (s)
            $dh = floor($dt / 3600);
            $dm = floor(($dt - $dh * 3600) / 60);
            $ds = ($dt - $dh * 3600 - $dm * 60);
            $uptime = ($dh > 0 ? ($dh <> 1 ? "$dh hours " : "1 hour ") : "").
                      ($dm > 0 || $dh > 0 ? ($dm <> 1 ? "$dm minutes" : "1 minute") : "just created");

            // array
            $l[] = array(
                       "id" => $r->id,
                       "name" => $r->name,
                       "description" => $r->description,
                       "uptime" => $uptime,
                       "owner" => $r->owner,
                       "num_users" => $r->num_users,
                       "got_rw_key" => $r->got_rw_key ? true : false,
                       "got_ro_key" => $r->got_ro_key ? true : false,
                       "permanent" => $r->permanent ? true : false
                   );
        }

        return $l;
    }









    // ======== keep alive stuff ;-) ==========

    // you need to call the following functions all the time, so the chat
    // and its participants will remain active

    // updates the given room (sets last_activity to now()). true on success
    public function keepRoomAlive($room_id)
    {
        $safe_id = $this->db->escape($room_id);
        return $this->db->query("update rooms set last_activity=utc_timestamp() where id=$safe_id");
    }

    // updates the given participant of the given room, so he or she won't be kicked due to inactivity
    public function keepParticipantAlive($room_id, $user_openid_identity)
    {
        return $this->db->query(
                "update user_participates_room set last_activity = utc_timestamp() ".
                "where room = ? and user = (select id from users where openid_identity = ? limit 1)",
                array($room_id, $user_openid_identity)
        );
    }





    // ============ user privileges ============

    // gets the privileges (bitwise set) of a given user
    private function _userPrivileges($room_id, $user_openid_identity)
    {
        $q = $this->db->query(
            "select permission_flags from user_participates_room inner join users ".
            "on user_participates_room.user = users.id where ".
            "user_participates_room.room = ? and users.openid_identity = ?",
            array($room_id, $user_openid_identity)
        );

        return $q->num_rows() > 0 ? $q->row(0)->permission_flags : 0;
    }

    // sets the privileges (bitwise set) of a given user
    private function _setUserPrivileges($room_id, $user_openid_identity, $privileges)
    {
        return $this->db->query(
            "update user_participates_room set permission_flags = ? where ".
            "room = ? and user = (select id from users where openid_identity = ? limit 1)",
            array($privileges, $room_id, $user_openid_identity)
        );
    }

    // user has read privileges?
    public function userHasReadPrivileges($room_id, $user_openid_identity)
    {
        return ($this->_userPrivileges($room_id, $user_openid_identity) & self::PERMISSION_READ) != 0;
    }

    // user has write privileges?
    public function userHasWritePrivileges($room_id, $user_openid_identity)
    {
        return ($this->_userPrivileges($room_id, $user_openid_identity) & self::PERMISSION_WRITE) != 0;
    }

    // user is admin (may kick users, etc)?
    public function userHasAdminPrivileges($room_id, $user_openid_identity)
    {
        return ($this->_userPrivileges($room_id, $user_openid_identity) & self::PERMISSION_ADMIN) != 0;
    }

    // generate permission flags for an user. returns false on error.
    public function grantPrivilegesToUser($room_id, $user_openid_identity, $user_key)
    {
        // user is admin! what are you doing?!
        if($this->userHasAdminPrivileges($room_id, $user_openid_identity))
            return $this->isReadWriteKeyCorrect($room_id, $user_key) || $this->isReadOnlyKeyCorrect($room_id, $user_key);

        // what privileges should we grant?
        if($this->isReadWriteKeyCorrect($room_id, $user_key))
            $flags = self::PERMISSION_READ | self::PERMISSION_WRITE;
        else if($this->isReadOnlyKeyCorrect($room_id, $user_key))
            $flags = self::PERMISSION_READ;
        else
            $flags = 0;

        // invalid key
        if($flags == 0)
            return false;

        // user is owner!!! let's give him or her admin privileges!!!!!!!
        $q = $this->db->query("select openid_identity from users where id = (select owner from rooms where id = ?)", array($room_id));
        if($q->num_rows() > 0 && ($q->row(0)->openid_identity === $user_openid_identity))
            $flags = self::PERMISSION_READ | self::PERMISSION_WRITE | self::PERMISSION_ADMIN;

        // valid key!
        $r = $this->db->query(
            "update user_participates_room set permission_flags = ? where room = ? and ".
            "user = (select id from users where openid_identity = ? limit 1)",
            array($flags, $room_id, $user_openid_identity)
        );

        if(!$r) return false;
        return true;
    }

    // give all privileges to an user
    public function grantAllPrivilegesToUser($room_id, $user_openid_identity)
    {
        $flags = self::PERMISSION_ADMIN | self::PERMISSION_WRITE | self::PERMISSION_READ;
        return $this->db->query(
                    "update user_participates_room set permission_flags = ? where room = ? ".
                    "and user = (select id from users where openid_identity = ? limit 1)",
                    array($flags, $room_id, $user_openid_identity)
               );
    }

    // this room has a Read-Only key?
    public function hasReadOnlyKey($room_id)
    {
        $safe_id = $this->db->escape($room_id);
        $q = $this->db->query("select (ro_key <> '') as b from rooms where id = $safe_id");
        return $q->num_rows() > 0 && $q->row(0)->b == 1;
    }

    // this room has a Read-Write key?
    public function hasReadWriteKey($room_id)
    {
        $safe_id = $this->db->escape($room_id);
        $q = $this->db->query("select (rw_key <> '') as b from rooms where id = $safe_id");
        return $q->num_rows() > 0 && $q->row(0)->b == 1;
    }

    // is the given Read-Only key correct?
    public function isReadOnlyKeyCorrect($room_id, $user_key)
    {
        $safe_id = $this->db->escape($room_id);
        $q = $this->db->query("select ro_key from rooms where id = $safe_id");
        return $q->num_rows() > 0 && (($q->row(0)->ro_key == '' && $user_key == '') || ($q->row(0)->ro_key == md5($user_key)));
    }

    // is the given Read-Write key correct?
    public function isReadWriteKeyCorrect($room_id, $user_key)
    {
        $safe_id = $this->db->escape($room_id);
        $q = $this->db->query("select rw_key from rooms where id = $safe_id");
        return $q->num_rows() > 0 && (($q->row(0)->rw_key == '' && $user_key == '') || ($q->row(0)->rw_key == md5($user_key)));
    }



    // ====================== collaborative system ===========================

    // get mobwrite (collaborative system) address
    public function getMWAddress($room_id)
    {
        $q = $this->db->query("select mw_addr from rooms where id = ?", array($room_id));

        if($q->num_rows() > 0)
            return $q->row(0)->mw_addr;
        else
            die("can't get mw_addr: room not found");
    }

}

?>
