<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class API extends CI_Controller
{
    public function index()
    {
        header('Content-Type: text/plain');

        // get the cclib
        $this->load->library('utils');
        $cclib = $this->utils->getCCLib();

        // parsing results
        $results = array();
        $current_group = null;
        $current_groupdescription = '';
        $current_commands = array();
        $current_description = '';
        $current_example = '';
        $current_params = array();
        $current_return = '';
        $relevant_fun = false;
        $code_mode = false;

        foreach($cclib as &$line) {
            // protection
            $line = htmlspecialchars($line);

            // found a parseable comment?
            if(preg_match("/''\s{0,5}(.*)$/", $line, $matches)) {
                $ln = $matches[1];
                $relevant_fun = substr($ln, 0, 6) != "@group";
                if(substr($ln, 0, 1) == '@') {
                    // a @group
                    if(preg_match("/^@group\s+(.*)$/", $ln, $m)) {
                        if($current_group != null) {
                            $results[] = array("title" => $current_group, "description" => $current_groupdescription, "content" => $current_commands);
                        }
                        $current_group = ($m[1]);
                        $current_groupdescription = '';
                        $current_commands = array();
                    }

                    // a @gdesc
                    else if(preg_match("/^@gdesc\s+(.*)$/", $ln, $m)) {
                        $current_groupdescription = ($m[1])." \n";
                    }

                    // a @param
                    else if(preg_match("/^@param\s+(\w+)\s*(.*)$/", $ln, $m)) {
                        $current_params[] = array("name" => ($m[1]), "description" => ($m[2]));
                    }

                    // a @return
                    else if(preg_match("/^@return\s+(.*)$/", $ln, $m)) {
                        $current_return = ($m[1]);
                    }

                    // a @code
                    else if(preg_match("/^@code/", $ln)) {
                        $code_mode = true;
                    }

                    // a @endcode
                    else if(preg_match("/^@endcode/", $ln)) {
                        $code_mode = false;
                    }

                    // a @i_dont_know
                    else {
                        $current_description .= ($ln)." \n";
                    }
                }
                else {
                    // a function description, or a code example
                    if(!$code_mode)
                        $current_description .= ($ln)." \n";
                    else
                        $current_example .= ($ln)."\n";
                }
            }

            // blank space?
            else if(preg_match("/^\s*$/", $line))
                $relevant_fun = false;

            // found a function definition?
            else if($relevant_fun && preg_match("/^\s*fun\s+([\w?\$_]+)/", $line, $matches)) {
                $current_commands[] = array("command" => $matches[1], "description" => (rtrim($current_description)), "example" => $current_example, "params" => $current_params, "return" => $current_return);
                $current_description = '';
                $current_example = '';
                $current_params = array();
                $current_return = '';
                $relevant_fun = false;
            }
        }

        if($current_group != null)
            $results[] = array("title" => $current_group, "description" => $current_groupdescription, "content" => $current_commands);

        // load the view
        $this->load->view('quickhelp_view', array('help' => $results));
    }
}

?>
