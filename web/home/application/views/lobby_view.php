<?php require("layout_begin.php"); ?>

<p>Logged in as <strong><?=$screenname?></strong>. <a href="<?=site_url('login/bye')?>">Logout?</a></p>

<?php if(isset($chat)) require("chat_view.php"); ?>

<table id="lobby_wrap"><tr><td>
<div id="newroom_container">
    <div>
        <p>Please join an existing room or</p>
        <p><input id="newroom_create" type="button" value="create a new one"></p>
    </div>
    <div>
      <form id="newroom_form" action="<?=site_url('lobby/create')?>" method="post">
        <table border="0">
          <tbody id="begin">
            <tr>
                <td>Project title</td>
                <td><input id="name" name="name" maxlength="30" size="30"></td>
            </tr>
            <tr>
                <td>Description</td>
                <td><textarea id="description" name="description" rows="10" cols="30"></textarea></td>
            </tr>
            <tr>
                <td width="30%">Read-write key</td>
                <td><input id="rwkey" name="rwkey" maxlength="30" size="30"><br>Allows others to write code and submit files. Shouldn't be blank.</td>
            </tr>
          </tbody>
          <tbody id="non-opt">
            <tr>
                <td>More options</td>
                <td><input id="newroom_moreoptions" type="button" value="click..."></td>
            </tr>
          </tbody>
          <tbody id="opt">
            <tr>
                <td width="30%">Read-only key</td>
                <td><input name="rokey" maxlength="30" size="30"><br>Gives an user permission to watch your work. You may leave it blank.</td>
            </tr>
          </tbody>
          <tbody id="end">
            <tr>
                <td colspan="2"><input type="submit" value="Go!"></td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
</div>
</td><td>
<div id="roomlist_container">
    <input type="hidden" id="roomlist_url" value="<?=site_url('lobby/lst')?>">
    <input type="hidden" id="roomjoin_url" value="<?=site_url('room/join')?>">
    <input type="hidden" id="room_url" value="<?=site_url('room/index')?>">
    <ul id="roomlist">
        <li><img src="<?=base_url().'img/chat_loading.gif'?>" alt="loading..."></li>
    </ul>
</div>
</td></tr></table>

<?php require("layout_end.php"); ?>