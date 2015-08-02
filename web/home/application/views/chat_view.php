<div id="chat">
    <div id="chat_wrap">
        <ul id="chat_content">
            <li>Welcome to <strong><?=$chatroom_name?></strong>!</li>
        </ul>
    </div>
    <div id="chat_pwrap">
        <ul id="chat_participants">
            <li><div><img src="<?=base_url().'img/chat_loading.gif'?>" alt="loading..."></div></li>
        </ul>
    </div>
    <form id="chat_form">
        <input type="text" id="chat_input" maxlength="128" value=" Type a text">
        <input type="hidden" id="chat_url" value="<?=site_url('chat').'/'?>">
        <input type="hidden" id="chat_uid" value="<?=$openid_identity?>">
        <input type="hidden" id="chat_rid" value="<?=$chatroom_id?>">
        <input type="hidden" id="chat_mid" value="<?=$chatroom_lastmid?>">
        <input type="hidden" id="chat_nick" value="<?=$chatroom_nick?>">
    </form>
</div>