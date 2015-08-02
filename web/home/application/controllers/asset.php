<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Asset extends CI_Controller
{
    // user-data
    private $_screenname;
    private $_openid_identity;

    // constructor
    public function __construct()
    {
        parent::__construct();
        $this->utils->checkIfLoggedIn();
        $this->load->library('AssetHelper');
        $this->load->model('Asset_Model');
        $this->_screenname = $this->session->userdata('screenname');
        $this->_openid_identity = $this->session->userdata('openid_identity');
    }

    // get the asset list of a room
    public function lst($room_id)
    {
        $files = $this->Asset_Model->getListOfAssetsBelongingTo($room_id);
        foreach($files as &$f) $f = htmlspecialchars($f);
        $this->load->view('listassets_view.php', array('l' => array('files' => $files, 'disk_space' => AssetHelper::DISK_SPACE, 'used_space' => $this->Asset_Model->totalSize($room_id))));
    }

    // downloads an asset
    public function download($room_id, $filename)
    {
        // forbidden?
        if(!($this->Room_Model->isParticipant($room_id, $this->_openid_identity) && $this->Room_Model->userHasReadPrivileges($room_id, $this->_openid_identity))) {
            header('Status: 403 Forbidden');
            exit;
        }
        // get the asset
        $f = $this->assethelper->getAbsoluteFilepath($room_id, $filename);
        if($f !== false && file_exists($f)) {
            // TODO: Last-Modified headers to improve performance & traffic...
            $asset = $this->Asset_Model->get($room_id, $filename);
            header('Content-Type: '.$asset['mime_type']);
            header('Content-Transfer-Encoding: binary'); // TODO: gzip
            header('Content-Length: '.$asset['filesize']);
            @readfile($f);
            exit;
        }

        header('Status: 404 Not Found'); // from http://php.net/manual/en/function.header.php
    }

    // uploads an asset (please submit a file field named 'userfile')
    public function upload($room_id)
    {
        $ret = array('status' => 'error', 'data' => '?');
        $orig_filename = $this->_safefilename($_FILES['userfile']['name']);
        $size = intval($_FILES['userfile']['size']);

        // uploading...
        if($size > AssetHelper::MAX_SIZE) {
            $ret = array('status' => 'error', 'data' => 'The file is too large!');
        }
        else if($this->Room_Model->isParticipant($room_id, $this->_openid_identity) && $this->Room_Model->userHasWritePrivileges($room_id, $this->_openid_identity)) {
            $config['upload_path'] = $this->assethelper->getUploadFolder();
            $config['file_name'] = $this->_generateRealFilename($room_id, $orig_filename);
            $config['allowed_types'] = AssetHelper::ALLOWED_TYPES;
            $config['max_size'] = (AssetHelper::MAX_SIZE) / 1024;
            $this->load->library('upload', $config);

            // do we have quota?
            if($this->Asset_Model->totalSize($room_id) + $size <= AssetHelper::DISK_SPACE) {
                // are we overwriting an existing file?
                $f = $this->assethelper->getAbsoluteFilepath($room_id, $orig_filename);
                if($f !== false && file_exists($f)) {
                    @unlink($f);
                    $this->Asset_Model->del($room_id, $orig_filename);
                }
    
                // upload it!
                if($this->upload->do_upload('userfile')) {
                    // success
                    $data = $this->upload->data();
                    $this->Asset_Model->put($room_id, $orig_filename, $data['file_name'], filesize($data['full_path']), $data['file_type'], $this->_openid_identity);
                    $ret = array('status' => 'ok', 'data' => '');
                }
                else {
                    // couldn't upload
                    $ret = array('status' => 'error', 'data' => htmlspecialchars($this->upload->display_errors('', '')));
                }
            }
            else {
                // not enough quota
                $ret = array('status' => 'error', 'data' => 'Disk quota exceeded.');
            }
        }
        else {
            // not enough privileges
            $ret = array('status' => 'error', 'data' => 'Not enough privileges.');
        }

        header('Content-Type: text/html'); // so that the browser won't display a 'download' dialog box.
        $this->load->view('uploadasset_view.php', array('response' => $ret));
    }

    // deletes an asset
    public function remove($room_id)
    {
        $filename = $this->input->post('filename');
        $ret = array('status' => 'error', 'data' => '?');

        if($this->Room_Model->isParticipant($room_id, $this->_openid_identity) && $this->Room_Model->userHasWritePrivileges($room_id, $this->_openid_identity)) {
            $f = $this->assethelper->getAbsoluteFilepath($room_id, $filename);
            if($f !== false && file_exists($f)) {
                @unlink($f);
                $this->Asset_Model->del($room_id, $filename);
                $ret = array('status' => 'ok', 'data' => '');
            }
            else
                $ret = array('status' => 'error', 'data' => 'File does not exist.');
        }
        else
            $ret = array('status' => 'error', 'data' => 'Not enough privileges.');

        header('Content-Type: text/plain');
        $this->load->view('removeasset_view.php', array('response' => $ret));
    }

    // grabs the properties of an asset ("size" in bytes, "uploader" and "date")
    public function properties($room_id)
    {
        $filename = $this->input->post('filename');

        // forbidden?
        if(!($this->Room_Model->isParticipant($room_id, $this->_openid_identity) && $this->Room_Model->userHasReadPrivileges($room_id, $this->_openid_identity))) {
            header('Status: 403 Forbidden');
            exit;
        }

        // loa the view :-)
        $ret = $this->Asset_Model->properties($room_id, $filename);
        foreach($ret as $key => $value) { $ret[$key] = htmlspecialchars($value); }
        $this->load->view('assetproperties_view.php', array('response' => $ret));
    }





    // ------ private ----------

    private function _generateRealFilename($room_id, $filename)
    {
        return 'r'.intval($room_id).'_'.uniqid().'.'.pathinfo($filename, PATHINFO_EXTENSION);
    }

    private function _safefilename($filename)
    {
        // adapted from: http://blogulate.com/content/remove-invalid-characters-from-a-filename/
        $temp = strtolower($filename);
        $temp = str_replace(" ", "_", $temp);

        $result = '';
        for($i=0; $i<strlen($temp); $i++) {
            if(preg_match('([0-9a-z_.])', $temp[$i]))
                $result = $result . $temp[$i];
        }

        return $result == '' ? 'illegal_file.txt' : $result;
    }
}

?>
