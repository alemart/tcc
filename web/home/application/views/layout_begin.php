<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>gameprototyper.com</title>
    <script src="<?=base_url()?>inc/jquery.min.js"></script>
    <script src="<?=base_url()?>inc/script.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/style.css"></link>
    <script src="<?=base_url()?>inc/jquery.simplemodal.1.4.1.min.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/simplemodal.css"></link>
<?php if(isset($openid)): ?>
    <script src="<?=base_url()?>inc/jquery.openid.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/openid.css"></link>
<?php endif; ?>
<?php if(isset($chat)): ?>
    <script src="<?=base_url()?>inc/chat.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/chat.css"></link>
<?php endif; ?>
<?php if(isset($lobby)): ?>
    <script src="<?=base_url()?>inc/lobby.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/lobby.css"></link>
<?php endif; ?>
<?php if(isset($room)): ?>
    <!-- MobWrite (license: Apache2) -->
    <!-- <script src="<?=base_url()?>inc/compressed_form.js"></script> -->
    <!-- <script src="<?=base_url()?>inc/compressed_codemirror.js"></script> -->
    <script src="<?=base_url()?>inc/diff_match_patch_uncompressed.js"></script>
    <script src="<?=base_url()?>inc/mobwrite_core.js"></script>
    <!-- <script src="<?=base_url()?>inc/mobwrite_form.js"></script> -->
    <script src="<?=base_url()?>inc/simple_differ.js"></script>
    <!-- <script src="<?=base_url()?>inc/mobwrite_codemirror.js"></script> -->
    <script src="<?=base_url()?>inc/mobwrite_codemirror_ui.js"></script>

    <!-- CodeMirror (license: MIT) -->
    <script src="<?=base_url()?>inc/cmui/lib/CodeMirror-2.0/lib/codemirror.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/cmui/lib/CodeMirror-2.0/lib/codemirror.css"></link>
    <script src="<?=base_url()?>inc/cmui/lib/CodeMirror-2.0/mode/chinchilla/chinchilla.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/cmui/lib/CodeMirror-2.0/mode/chinchilla/chinchilla.css"></link>
    <script src="<?=base_url()?>inc/cmui/js/codemirror-ui.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/cmui/css/codemirror-ui.css"></link>

    <!-- TreeView (license: MIT) -->
    <script src="<?=base_url()?>inc/jquery.cookie.js"></script>
    <script src="<?=base_url()?>inc/jquery.treeview.js"></script>
    <script src="<?=base_url()?>inc/jquery.treeview.edit.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/jquery.treeview.css"></link>

    <!-- jQuery.Upload (license: MIT) -->
    <script src="<?=base_url()?>inc/jquery.upload-1.0.2.min.js"></script>

    <!-- Room -->
    <script src="<?=base_url()?>inc/runtime.js"></script>
    <script src="<?=base_url()?>inc/room.js"></script>
    <link rel="stylesheet" href="<?=base_url()?>inc/room.css"></link>
<?php endif; ?>
</head>
<body>

<header>
    <span id="title"><a href="<?=site_url('welcome')?>">gameprototyper.com</a></span>
    <span id="subtitle">alpha</span>
    <span id="menu"><a href="<?=site_url('welcome')?>">Home</a> | <!-- <a href="<?=site_url('demos/')?>">Demos</a> | --><a href="<?=site_url('help/learn')?>">Learn</a> | <a href="<?=site_url('help/faq')?>">FAQ</a> | <a href="<?=site_url('help/contact')?>">Contact</a></span>
    <br clear="all">
</header>

<section id="content">
<?php if(isset($flash)): ?>
<div id="flash"><?=htmlspecialchars($flash)?></div>
<?php endif; ?>
