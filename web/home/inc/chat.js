var chatInstance = null;

function Chat(updateFrequency, minFloodInterval)
{
    var _me = this;
    var _url = $('#chat_url').val();
    var _uid = $('#chat_uid').val();
    var _rid = $('#chat_rid').val();
    var _nick = $('#chat_nick').val();
    var _int = null;
    var _participants = [];
    var _enableDiff = false;
    var _firstFocus = true;
    var _latestSubmission = (new Date()).getTime();

    // find who has entered and who has left the room
    var _findRoomFlow = function(oldlist, newlist) {
        var fin = [], fout = [];
        if(_enableDiff) {
            var i, j, found;

            // find those who have entered the room
            for(i=0; i<newlist.length; i++) {
                found = false;
                for(j=0; j<oldlist.length && !found; j++)
                    found = oldlist[j] == newlist[i];
                if(!found)
                    fin.push(newlist[i]);
            }

            // find those who have left the room
            for(j=0; j<oldlist.length; j++) {
                found = false;
                for(i=0; i<newlist.length && !found; i++)
                    found = oldlist[j] == newlist[i];
                if(!found)
                    fout.push(oldlist[j]);
            }
        }
        _enableDiff = true;
        return { "in": fin, "out": fout };
    }

    var _addMessage = function(html) {
        $('<li>' + html + '</li>').hide().appendTo('#chat_content').fadeIn();
    }

    var _updateParticipantsList = function(list) {
        $('#chat_participants li').remove();
        $.each(list, function(idx, val) {
            $("#chat_participants").append('<li>' + val + '</li>');
        });
    }

    var _scrollDown = function() {
        $('#chat_wrap').animate({scrollTop: $('#chat_wrap')[0].scrollHeight});
    }

    // --------------------------------------

    // receives updates
    this.receive = function() {
        $.post(_url + 'receive/' + _rid, {'since': $('#chat_mid').val()}, function(data) {
            $('#chat_mid').val(data.i);
            var flow = _findRoomFlow(_participants, data.p);

            $.each(flow["in"], function(idx, val) {
                _addMessage('<strong>' + val + '</strong> has joined the room.');
            });
            for(var i=0; i<data.m.length; i++) {
                _addMessage('<strong>' + data.m[i].s + ':</strong> ' + data.m[i].m);
            }
            $.each(flow["out"], function(idx, val) {
                _addMessage('<strong>' + val + '</strong> has left the room.');
            });

            _updateParticipantsList(_participants = data.p);
            _scrollDown();
        }, 'json');
    }

    // sends the current message
    this.send = function() {
        var txt = $.trim($("#chat_input").val());
        if(txt != '') {
            $("#chat_input").val('');
            _addMessage('<strong>' + _nick + ':</strong> ' + txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
            _scrollDown();
            $.post(_url + 'send/' + _rid, {'message': txt }, function(data) { });
        }
    }

    // initial configuration
    $("#chat_form").submit(function() { return false; });
    $("#chat_input").focus(function() { if(_firstFocus) { _firstFocus = false; $("#chat_input").val(""); } });
    $.post(_url + 'join/' + _rid, {}, function() {
        // update the chat automatically
        _int = window.setInterval(_me.receive, updateFrequency);
        _me.receive();

        // make it possible to send messages
        $("#chat_form").submit(function() {
            var now = (new Date()).getTime();
            if(now > _latestSubmission + minFloodInterval) { // flood control
                _me.send();
                _latestSubmission = now;
            }
            return false;
        });

        // you must leave some time ;-)
        $(window).unload(function() {
            if(window.location.href.indexOf('lobby') >= 0)
                $.ajax({async: false, type: 'POST', url: _url + 'leave/' + _rid});
        });
    });
}

$(function() { chatInstance = new Chat(3500, 1000); });
