<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Login extends CI_Controller
{
    // constructor
    public function __construct()
    {
        parent::__construct();

        // user is already logged in
        if($this->uri->segment(2) != 'bye') {
            $openid_identity = $this->session->userdata('openid_identity');
            if($openid_identity <> '') {
                if($this->User_Model->isLoggedIn($openid_identity))
                    redirect(site_url('lobby'));
            }
        }
    }

    // login page
    public function index()
    {
        $this->load->view('login_view', array('openid' => true));
    }

    // login with OpenID
    public function openid()
    {
        // load stuff
        $this->load->helper('url');
        $this->load->library('lightopenid', array('host' => base_url()));
        $openid =& $this->lightopenid;

        if(!$openid->mode) {
            // signing in... :-)
            if($this->input->post('url') && $openid->hostExists($this->input->post('url'))) {
                $openid->identity = $this->input->post('url');
                $openid->required = array('contact/email', 'namePerson/friendly', 'namePerson/first', 'namePerson/last');
                redirect($openid->authUrl());
            }
            else
                $this->load->view('login_view', array('openid' => true, 'flash' => 'It seems that the given OpenID does not exist.'));
        }
        elseif($openid->mode == 'cancel') {
            // user has cancelled the login
            $this->load->view('login_view', array('openid' => true, 'flash' => 'The login has been cancelled.'));
        }
        elseif($openid->validate()) {
            // yaaaaaay!!! success
            $attr = $openid->getAttributes();

            if(isset($attr['contact/email'])) {
                $screenname = preg_replace('/@.*$/', '', $attr['contact/email']);
                $email = $attr['contact/email'];
                $openid_identity = $openid->identity;

                // trying to clone a screen name?
                if($this->User_Model->clonedScreenname($screenname, $openid_identity)) {
                    $i = 2; $lim = 50;
                    $orig = $screenname;

                    do {
                        $screenname = $orig.strval($i++);
                    }
                    while($i < $lim && $this->User_Model->clonedScreenname($screenname, $openid_identity));

                    if($i >= $lim)
                        die('Can\'t login as '.$orig);
                }

                // is the user invited?
                if($this->User_Model->isInvited($email))
                    $this->_login($openid_identity, $screenname, $email);
                else
                    $this->load->view('login_view', array('openid' => true, 'flash' => 'Although your OpenID is valid, it seems that you don\'t have an invitation. <a href="'.site_url('help/invitation').'">Learn more...</a>'));
            }
            else
                $this->load->view('login_view', array('openid' => true, 'flash' => 'It seems that the selected OpenID provider does not return an e-mail address. Please select a different one.'));
        }
    }

    // login anonymously
    public function anonymous()
    {
        $this->_loginAsAGuest();
    }

    // close session
    public function bye()
    {
        $this->_logout();
    }




    // -------------- private stuff -----------------------

    // login into our system
    private function _login($openid_identity, $screenname, $email)
    {
        $sess_openid_identity = $this->session->userdata('openid_identity');

        if(1) { //bugs on chrome: if(!$this->User_Model->isLoggedIn($openid_identity) && !$this->User_Model->isLoggedIn($sess_openid_identity)) {
            if(!$this->User_Model->login($openid_identity, $screenname, $email)) {
                $this->load->view('login_view', array('openid' => true, 'flash' => 'Can\'t login due to a database error. This shouldn\'t happen.'));
                return;
            }

            $this->session->set_userdata(array(
                'screenname' => $screenname,
                'email' => $email,
                'openid_identity' => $openid_identity
            ));
        }

        redirect(site_url('lobby'));
    }

    // login as a guest
    private function _loginAsAGuest()
    {
        $arr = $this->User_Model->loginAsAGuest();
        if($arr) {
            $this->session->set_userdata($arr);
            redirect(site_url('lobby'));
        }
        else
            $this->load->view('login_view', array('openid' => true, 'flash' => 'Can\'t login anonymously due to a database error. This shouldn\'t happen.'));
    }

    // logout
    private function _logout()
    {
        $openid_identity = $this->session->userdata('openid_identity');

        if($this->User_Model->isLoggedIn($openid_identity)) {
            // leave rooms
            $this->load->model('Room_Model');
            $this->Room_Model->leaveAllRooms($openid_identity);

            // logout
            $this->User_Model->logout($openid_identity);
            $this->session->sess_destroy();
        }

        redirect(site_url('welcome'));
    }
}

?>
