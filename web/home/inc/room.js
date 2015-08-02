var editor = null;

// if the text of the editor has changed, this will be called...
function textChanged(editor)
{
    if(editor.getCode().length > 3*65535) {
        alert("Your code is too large. :(");
        editor.setCode(editor.getCode().substr(0, 3*65535));
    }
}

// Virtual Machine
var vm = {
    'gameData': {
        'title':    'Untitled',
        'media':    { },
        'program':  [1, 0, 0]
    },

    'engine': null
};

$(function() {
try {
    // initializing...
    vm.gameData.title = $('#roomdev_name').val();
    vm.engine = new RuntimeEngine(200, 128000, 8388608); //200, 30000, 65536);
    $('<input type="text" id="focusblocker" style="position: absolute; top: -2000px">').appendTo('#gameArea');

    // ------------------------------
    // VM
    // ------------------------------

    // when the user clicks on 'compile' ...
    $("#compile").click(function() {
        // let's disable a few things
        var code = getClientText();
        pauseEditor();
        vm.engine.powerOff();

        // show a 'compiling' dialog...
        $('#printer').text('Please wait...');
        $('#focusblocker').focus();
        $('#gameArea').modal({
            minWidth: 20+$('#screen0').get(0).width, minHeight: 70+$('#screen0').get(0).height, opacity: 0, escClose: false,
            onClose: function(dialog) { vm.engine.powerOff(); resumeEditor(); $.modal.close(); }
        });

        // compile the game
        $.post($('#roomdev_cc').val(), { "code": code }, function(raw) {
            try {
                bin = $.parseJSON(raw);
                if(bin.status == "ok") {
                    // compiler: success!
                    $("#printer").text(vm.gameData.title);
                    vm.gameData.program = bin.data;
                    vm.gameData.media = [];
                    if(assetList) {
                        $.each(assetList(), function(idx, val) {
                            vm.gameData.media[val] = $('#roomdev_asset').val().replace('?', 'download') + '/' + val;
                        });
                    }
                    vm.engine.loadGame(vm.gameData, vm.engine.powerOn);
                }
                else {
                    // compiler: error
                    alert(bin.data);
                    $.modal.close();
                }
            }
            catch(e) {
                vm.engine.powerOff();
                alert("FATAL ERROR\n\n" + e.message);
            }
        });
    });

    // when the user clicks on 'export'
    $("#export").click(function() {
        alert("The export tool isn't available yet. Sorry!");
    });


    // ------------------------------
    // Quick Help
    // ------------------------------

    // initializing the Quick Help...
    (function() {
        // initial configuration (loading...)
        $('#roomdev_apiwrap > img').css('padding-top', '10px');
        $('#roomdev_apiwap > dl.accordion').hide();

        // some ajax to grab the Quick Help data
        $.get($('#roomdev_api').val(), { }, function(data) {
            $('#roomdev_apiwrap > img').hide();
            for(var key in data) {
                $('#roomdev_apiwrap > dl.accordion').append('<dt>' + data[key].title + '</dt>').append('<dd>' +
                    '<dl>' +
                    data[key].description +
                    (function() { var s = ''; $.each(data[key].content, function(idx, cmd) {
                        s +=
                        // command name
                        '<dt>' + cmd.command + '</dt>' +

                        // command description
                        '<dd>' +
                            cmd.description +
                            ' <a class="expand_command_options" href="javascript:">[+]</a>' +

                            // advanced command options
                            '<dl class="command_options">' +
                                // Parameters
                                '<dt>Parameters:</dt>' +
                                '<dd>' + (
                                    (cmd.params.length == 0) ? 'None' : 
                                    (function() { var x = ''; $.each(cmd.params, function(idx, param) {
                                        x += '<dt>' + param.name + '</dt><dd>' + param.description + '</dd>';
                                    }); return '<dl>' + x + '</dl>'; })()
                                ) + '</dd>' +

                                // Returns
                                '<dt>Returns:</dt>' +
                                '<dd>' + (cmd['return'] == '' ? 'Nothing' : cmd['return']) + '</dd>' +

                                // Example (if any)
                                (cmd.example == '' ? '' : '<dt>Example:</dt><dd><pre>' + cmd.example + '</pre></dd>') +
                            '</dl>' +
                        '</dd>' +
                        '';
                    }); return s; })() +
                    '</dl>' +
                '</dd>');
            }

            // all right, let's add the functionality to the accordion
            $('#roomdev_apiwrap > dl.accordion > dt').unbind('click');
            $('#roomdev_apiwrap > dl.accordion > dt').click(function() {
                if(!($(this).next().is(':visible'))) {
                    //$('dl.accordion > dd').slideUp('fast');
                    $(this).next().slideDown('fast');
                }
                else
                    //$('dl.accordion > dd').slideUp('fast');
                    $(this).next().slideUp('fast');
            });

            // command_options functionality
            $('#roomdev_apiwrap a.expand_command_options').click(function() {
                var cmdOpt = $(this).next('.command_options');
                $(this).text( $(this).text() == '[+]' ? '[-]' : '[+]' );
                cmdOpt.toggle();
            });

            // the quick help may be displayed now.
            $('#roomdev_apiwrap > dl.accordion').fadeIn();
        }, 'json');
    })();


    // ------------------------------
    // Game Assets
    // ------------------------------
    // builds the tree
    $('#assetbrowser').treeview();

    // returns the category, "gfx", "snd" or "misc", of a given asset
    var categoryOf = function(file) {
        var ext = file.substr(file.lastIndexOf("."));
        var cat = { ".png" : "gfx", ".jpg" : "gfx", ".ogg" : "snd", ".wav" : "snd", ".txt": "misc" };
        return (ext in cat) ? cat[ext] : "";
    };

    // the assets I have
    var assetList = function() {
        var l = [];
        $('#assetbrowser span.file').each(function(idx, val) { l.push($(val).text()); });
        return l;
    };
    window.assetList = assetList;

    // uploads an asset
    $('#roomdev_assetswrap #upload').click(function() {
        if(!($('#roomdev_code').get(0).readOnly)) {
            $('#assetUpload').modal({
                containerCss: {width: '320px', height: '270px'}, opacity: 0, escClose: false
            });
        }
        else
            alert("Read-Only users can't upload files. Sorry!");
    });

    $('#assetUpload #userfile').change(function() {
        var path = $('#roomdev_asset').val().replace('?', 'upload');
        $('#assetUpload > div:first').toggle();
        $('#assetUpload > div:last').toggle();

        $(this).upload(path, function(data) {
            if(data.status != 'ok')
                alert('Error: ' + data.data);
            else if(refreshAssetBrowser)
                refreshAssetBrowser();
            $('#assetUpload > div:first').toggle();
            $('#assetUpload > div:last').toggle();
            $.modal.close();
        }, 'json');
    });

    // removes an asset
    var removeAsset = function(asset) {
        if(confirm("Are you sure you want to delete " + asset + "?")) {
            var path = $('#roomdev_asset').val().replace('?', 'remove');
            $('#assetPreview').html('Please wait...');
            $.post(path, {'filename': asset}, function(data) {
                if(data.status == 'ok') {
                    if(refreshAssetBrowser)
                        refreshAssetBrowser();
                }
                else
                    alert("Error: " + data.data);
                $.modal.close();
            }, 'json');
        }
    }

    // views an asset
    var viewAsset = function(asset) {
        var path = $('#roomdev_asset').val().replace('?', 'download') + '/' + asset;
        var esc = function(str) { return str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;"); }

        var continuation = function(data) {
            $('#assetPreview').html('<p><strong>' + esc(asset) + '</strong></p><p>' + (function() { switch(categoryOf(asset)) {
                case 'gfx': return '<img alt="Image" src="' + path + '"><pre>\' How to use:' + "\n" + 'drawImage "' + esc(asset) + '", 0, 0</pre>';
                case 'snd': return '<audio controls="controls" src="' + path + '" loop="loop" autoplay="autoplay"></audio>';
                case 'misc': return '<pre>' + esc(data) + '</pre>';
                default: return 'No visualization is available.';
            }})() + '</p>');

            var meta = $('<p class="meta">Loading meta data...</p>').appendTo('#assetPreview');
            $.post($('#roomdev_asset').val().replace('?', 'properties'), {'filename': asset}, function(data) {
                meta.fadeIn().html('<p class="meta">' +
                    '<strong>Uploader:</strong> ' + esc(data['uploader']) + '<br>' +
                    '<strong>Filesize:</strong> ' + Math.round(parseInt(esc(data['size'])) / 1024) + ' KB<br>' +
                    '<strong>Uploaded:</strong> ' + esc(data['date']) + ' UTC' +
                '</p>');
            }, 'json');

            if(!($('#roomdev_code').get(0).readOnly))
                $('<button>Delete</button>').click(function(e) { removeAsset(asset); }).appendTo('#assetPreview');
        };

        $('#assetPreview').html('Loading...').modal({
            containerCss: {width: '420px', height: '420px'}, opacity: 0, escClose: false
        });
        if(categoryOf(asset) == 'misc')
            $.get(path, {}, continuation, 'html');
        else
            continuation();
    };

    // refreshes the tree
    var refreshAssetBrowser = function() {
        // returns the difference of sets (A\B)
        var difference = function(a, b) {
            var c = [];
            $.each(a, function(i, v) { var u = false; $.each(b, function(i_, v_) { u = u || (v==v_); }); if(!u) c.push(v); });
            return c;
        };

        // which assets does the server have?
        $.get($('#roomdev_asset').val().replace('?', 'lst'), {}, function(data) {
            // added/removed assets
            var myAssets = assetList();
            var serverAssets = data.files;
            var addedAssets = difference(serverAssets, myAssets);
            var removedAssets = difference(myAssets, serverAssets);

            // update the tree
            $.each(addedAssets, function(idx, val) {
                var branches = $('<li><span class="file">' + val + '</span></li>').click(function(e) { viewAsset(val); }).appendTo('#assetbrowser #' + categoryOf(val));
                $('#assetbrowser').treeview({add: branches});
            });
            $.each(removedAssets, function(idx, val) {
                var branches = $('#assetbrowser span.file').filter(function(idx) { return $(this).text() == val; }).map(function(i, e) {
                    return $(e).parent().get(0);
                });
                $('#assetbrowser').treeview({remove: branches});
            });

            // update the 'free disk space'
            $('#freediskspace').text( Math.round(100 * (1 - data.used_space / data.disk_space)) + '%' );
        }, 'json');
    };
    window.refreshAssetBrowser = refreshAssetBrowser;

    (function() { refreshAssetBrowser(); setInterval(refreshAssetBrowser, 10000); })();
}
catch(e) {
    vm.engine.powerOff();
    alert("FATAL ERROR\n\n" + e.message);
}
});
