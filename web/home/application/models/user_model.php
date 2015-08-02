<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User_Model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();

        // log out inactive users
        $safe_val = $this->db->escape($this->config->item('sess_expiration'));
        $this->db->query(
            "update users set logged_in = false where logged_in = true and ".
            "date_add(last_activity, interval $safe_val second) < utc_timestamp()"
        );
    }

    // checks if $email is in the invited users list
    public function isInvited($email)
    {
        $safe_email = $this->db->escape($email);
        $q = $this->db->query("select count(id) as c from invitedusers where email=$safe_email");
        return intval($q->row(0)->c) > 0;
    }

    // checks if an user is logged in
    public function isLoggedIn($openid_identity)
    {
        $safe_id = $this->db->escape($openid_identity);
        $q = $this->db->query("select count(id) as c from users where openid_identity=$safe_id and logged_in=true");
        return intval($q->row(0)->c) > 0;
    }

    // is there a person with the same screenname, but with a different openid_identity?
    public function clonedScreenname($screenname, $openid_identity)
    {
        $safe_sn = $this->db->escape($screenname);
        $safe_id = $this->db->escape($openid_identity);
        $q = $this->db->query("select count(id) as c from users where screenname=$safe_sn and openid_identity<>$safe_id");
        return intval($q->row(0)->c) > 0;
    }

    // is the given user a guest?
    public function isGuest($openid_identity)
    {
        $prefix = base_url().'uauth/';
        return substr($openid_identity, 0, strlen($prefix)) == $prefix;
    }

    // get the screenname using its openid_identity
    public function getScreenname($openid_identity)
    {
        $q = $this->db->query("select screenname from users where openid_identity=?", array($openid_identity));
        return $q->num_rows() > 0 ? $q->row(0)->screenname : "null";
    }

    // login as a guest
    public function loginAsAGuest()
    {
        $name = uniqid('guest_');
        $identity = base_url().'uauth/'.md5('#!'.$name);
        $email = '';

        if($this->login($identity, $name, $email))
            return array('screenname' => $name, 'email' => $email, 'openid_identity' => $identity);
        else
            return false;
    }

    // login! returns true on success, false otherwise
    public function login($openid_identity, $screenname, $email)
    {
        $ip = $this->input->ip_address();
        $guest = $this->isGuest($openid_identity) ? 1 : 0;

        $q = $this->db->query(
            "insert into users values(null, ?, ?, ?, true, utc_timestamp(), ?, utc_timestamp(), ?) ".
            "on duplicate key update screenname=?, email=?, logged_in=true, ip_address=?, ".
            "last_activity=utc_timestamp()",
            array($screenname, $email, $openid_identity, $ip, $guest, $screenname, $email, $ip)
        );

        return $q ? true : false;
    }

    // logout. returns true on success, false otherwise
    public function logout($openid_identity)
    {
        $safe_id = $this->db->escape($openid_identity);
        $q = $this->db->query("update users set logged_in = false where openid_identity = $safe_id");
        return $q ? true : false;
    }
}

?>
