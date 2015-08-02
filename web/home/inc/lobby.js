$(function() {
    // --------------------------------------
    // new room form
    // --------------------------------------

    // css rules
    $("#newroom_container input:text, textarea").addClass("text");

    // create new room
    $("#newroom_create").click(function() {
        $("#newroom_container > div:first-child").slideUp();
        $("#newroom_container > div:last-child").slideDown();
    });

    // more options...
    $("#newroom_moreoptions").click(function() {
        $("tbody#non-opt").fadeOut(400, function() {
            $("tbody#opt").fadeIn();
        });
    });

    // form validation
    $("#newroom_form").submit(function() {
        // mandatory fields: name & description
        var m = [];
        if($.trim($("#newroom_form #name").val()) == '')
            m.push('name');
        if($.trim($("#newroom_form #description").val()) == '')
            m.push('description');
        if(m.length > 0) {
            var s = '';
            $.each(m, function(idx, val) { s += '\n' + (1+idx) + '. ' + val; });
            alert("The following fields are required:" + s);
            return false;
        }

        // I'd like a read-write key!
        if($("#newroom_form #rwkey").val() == '')
            return !!confirm("It's highly recommended to specify a read-write key. Proceed without one?");

        // the validation is ok
        return true;
    });




    // --------------------------------------
    // room list
    // --------------------------------------

    // updates the room list
    var _updateRoomList = function() {
        var url = $("#roomlist_url").val();
        var maxlen = 140;

        // we receive an updated room list every once in a while...
        $.get(url, {}, function(data) {
            $("#roomlist").fadeOut(400, function() {
                // clear the current room list
                $(this).empty();

                // no rooms atm
                if(data.length == 0)
                    $('<li>There are no active rooms at the moment.</li>').appendTo("#roomlist");

                // for each room...
                $.each(data, function(idx, room) {
                    // add this room to the list
                    var str = '';
                    str += '<table><tr><td>';
                    str += '<strong>' + room.name + '</strong>';
                    str += ': ' + room.num_users + (room.num_users == 1 ? " user" : " users");
                    str += '<br><strong>Created by:</strong> ' + room.owner;
                    str += '<br><strong>Uptime:</strong> ' + room.uptime;
                    str += '<br><br><div id="roomDescription' + room.id + '">';
                    if(room.description.length > maxlen)
                        str += room.description.substr(0, maxlen) + '... <a href="#" id="expandRoom' + room.id + '">[more]</a>';
                    else
                        str += room.description.replace('\n', '<br>');
                    str += '</div>';
                    str += '</td><td>';
                    str += '<input id="joinRoom' + room.id + '" type="button" class="button" value="Join room">';
                    if(room.got_ro_key || room.got_rw_key) {
                        if(!room.permanent) str += '<div class="icon_key"></div>';
                        str += '<div id="roomPassword' + room.id + '" class="roomPassword">';
                        str += '<h1>This room requires a password.</h1>';
                        str += '<form id="roomPasswordForm' + room.id + '">';
                        str += '<p><input type="password" id="passwordField' + room.id + '"> <input type="submit" class="button" id="checkPassword' + room.id + '" value="OK"></p>';
                        str += '</form>';
                        if(!room.got_ro_key)
                            str += '<p>If you do not have a key, you may leave the field in blank to join as an spectator.</p>';
                        else
                            str += '<p>Spectators without a key are not allowed.</p>';
                        str += '<div class="response"></div>';
                        str += '</div>';
                    }
                    str += '</td></tr></table>';
                    $('<li>' + str + '</li>').appendTo("#roomlist");

                    // attaching a few events to this room...
                    $('#expandRoom' + room.id).click(function() {
                        // THE USER WANTS TO KNOW MORE ABOUT THIS ROOM  
                        $("#roomDescription" + room.id).fadeOut(400, function() {
                            $(this).text(room.description).fadeIn();
                        });
                    });

                    $('#joinRoom' + room.id).click(function() {
                        // THE USER WANTS TO JOIN THIS ROOM
                        var joinDirectly = ($("#roomPassword" + room.id).length <= 0) || (room.permanent && $("#chat_input").val() != "/edit");
                        if(joinDirectly) {
                            $('#joinRoom' + room.id).attr('disabled', true).val('Working...');
                            $.post($("#roomjoin_url").val() + '/' + room.id, {'key': ''}, function() {
                                location.href = $("#room_url").val() + "/" + room.id;
                            });
                        }
                        else
                            $("#roomPassword" + room.id).modal();
                    });

                    $('#roomPasswordForm' + room.id).submit(function() {
                        // THE USER WILL AUTHENTICATE AND JOIN THIS ROOM
                        $('#roomPassword' + room.id + ' .response').text('Signing in...').fadeIn();
                        $.post($("#roomjoin_url").val() + '/' + room.id, {'key': $('#passwordField' + room.id).val() }, function(data) {
                            if(data.response != 'ok') {
                                // authentication failed
                                $('#roomPassword' + room.id + ' .response').text(data.response);
                            }
                            else {
                                // the authentication was successfully done
                                $('#roomPassword' + room.id + ' .response').text('Success!');
                                location.href = $("#room_url").val() + '/' + room.id;
                            }
                        }, 'json');
                        return false;
                    });
                });

                // cute fade-in effect
                $(this).fadeIn();
            });
        }, 'json');
    };

    _updateRoomList();
    setInterval(_updateRoomList, 30000);
});
