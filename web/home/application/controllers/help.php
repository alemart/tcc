<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Help extends CI_Controller
{
    public function index()
    {
        redirect(site_url('welcome'));
    }

    public function invitation()
    {
        redirect(site_url('help/faq#invitation'));
    }

    public function learn()
    {
        $this->load->view('learn_view');
    }

    public function faq()
    {
        $this->load->view('faq_view');
    }

    public function contact()
    {
        $this->load->view('contact_view');
    }

    public function openid()
    {
        redirect(site_url('help/faq#openid'));
    }
}

?>