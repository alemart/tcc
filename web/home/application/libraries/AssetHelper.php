<?php
if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class AssetHelper
{
    // constants
    const ASSET_FOLDER = '/user_uploads/assets/';
    const ALLOWED_TYPES = 'png|jpg|ogg|wav|txt'; // also check config/mimes.php
    const MAX_SIZE = 2097152; // 2 MB ... 1048576; // 1 MB
    const DISK_SPACE = 5242880; // 5 MB

    // gets the absolute, real filepath of a given asset
    // returns FALSE on error
    public function getAbsoluteFilepath($room_id, $filename)
    {
        $ci =& get_instance();
        $ci->load->model('Asset_Model');
        $asset = $ci->Asset_Model->get($room_id, $filename);
        if($asset !== false) {
            $real_filename = $asset['real_filename'];
            return dirname($_SERVER['SCRIPT_FILENAME']).(self::ASSET_FOLDER).$real_filename;
        }
        else
            return false;
    }

    // the absolute filepath of the upload folder
    public function getUploadFolder()
    {
        return dirname($_SERVER['SCRIPT_FILENAME']).(self::ASSET_FOLDER);
    }

    // deletes all asset files of a room
    public function purgeFiles($room_id)
    {
        $ci =& get_instance();
        $ci->load->model('Asset_Model');
        $files = $ci->Asset_Model->getListOfAssetsBelongingTo($room_id);
        foreach($files as &$filename) {
            $f = $this->getAbsoluteFilepath($room_id, $filename);
            if($f !== false && file_exists($f)) {
                @unlink($f);
                $ci->Asset_Model->del($room_id, $filename);
            }
        }
    }
}

?>
