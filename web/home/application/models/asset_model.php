<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Asset_Model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    // retrieves an array containing all the (cute) file names of the assets
    // of a given room
    public function getListOfAssetsBelongingTo($room_id)
    {
        $arr = array();
        $q = $this->db->query("select cute_filename from assets where room = ?", array($room_id));
        for($i=0; $i<$q->num_rows(); $i++)
            array_push($arr, $q->row($i)->cute_filename);
        return $arr;
    }

    // retrieve data from an asset, given its (cute) file name and room
    // the data will be an associative array containing:
    // "creation_date"
    // "real_filename"
    // "filesize"
    // "mime_type"
    //
    // NOTE: returns false if the asset doesn't exist
    public function get($room_id, $filename)
    {
        $q = $this->db->query("select * from assets where room = ? and cute_filename = ?", array($room_id, $filename));

        if($q->num_rows() == 0)
            return false;

        $row = $q->row(0);
        return array(
            "creation_date" => $row->creation_date,
            "real_filename" => $row->real_filename,
            "filesize" => $row->filesize,
            "mime_type" => $row->mime_type
        );
    }

    // inserts a new asset into the database
    // NOTE: if 'filename' is already an asset of 'room_id', it will be updated.
    public function put($room_id, $filename, $real_filename, $filesize, $mime_type, $uploader_openid)
    {
        $this->del($room_id, $filename);
        $q = $this->db->query("insert into assets values(null, ?, utc_timestamp(), ?, ?, ?, ?, (select id from users where openid_identity = ?))", array($room_id, $filename, $real_filename, $filesize, $mime_type, $uploader_openid));
        return $q;
    }

    // removes an asset from a room
    // this doesn't remove any file; it just updates the model!
    public function del($room_id, $filename)
    {
        $q = $this->db->query("delete from assets where room = ? and cute_filename = ?", array($room_id, $filename));
        return $q;
    }

    // total size of the files
    public function totalSize($room_id)
    {
        $q = $this->db->query("select sum(filesize) as totalsize from assets where room = ?", array($room_id));
        return $q->num_rows() > 0 ? intval($q->row(0)->totalsize) : 0;
    }

    // properties of an asset
    public function properties($room_id, $filename)
    {
        $q = $this->db->query("select assets.creation_date as creation_date, assets.filesize as filesize, users.screenname as uploader from assets inner join users on assets.uploader = users.id where assets.room = ? and assets.cute_filename = ?", array($room_id, $filename));
        if($q->num_rows() > 0) {
            $r = $q->row(0);
            return array('date' => $r->creation_date, 'size' => $r->filesize, 'uploader' => $r->uploader);
        }
        else
            return false;
    }
}

?>
