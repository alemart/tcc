<?php
if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Utils
{
    // checks if we're running this from the development environment or not
    public function isRunningLocally()
    {
        $ci =& get_instance();
        return strpos(base_url(), "localhost") !== false;
    }

    // checks if the user is logged in. If not, redirect to the
    // welcome page. Returns true iff the user is logged in!
    public function checkIfLoggedIn($redirect_automatically = true)
    {
        // code igniter rulez!!1
        $ci =& get_instance();

        // check if the user is logged in
        $openid_identity = $ci->session->userdata('openid_identity');
        if($openid_identity != '') {
            $ci->load->model('User_Model');
            if($ci->User_Model->isLoggedIn($openid_identity))
                return true;
        }

        // not logged in
        if($redirect_automatically) {
            redirect(site_url('welcome'));
            exit;
        }

        return false;
    }

    // returns an array containing the lines of cclib
    public function getCCLib()
    {
        $lib_path = dirname($_SERVER['SCRIPT_FILENAME']).'/../cgi-bin/cclib.php';
        $fp = @file($lib_path);

        if($fp !== false) {
            foreach($fp as &$f)
                $f = rtrim($f);
            return $fp;
        }
        else
            return array();
    }
}

?>
