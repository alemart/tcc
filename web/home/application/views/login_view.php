<?php require("layout_begin.php"); ?>
<h1>Join your friends and prototype exciting browser games!</h1>

<div id="html5logo">
    <img src="<?=base_url()?>img/html5.png" alt="HTML5">
</div>

<table width="100%" border="0">
    <tr>
        <td id="left" width="25%" valign="top">
            <article>
<h1>HTML5 powered!</h1>
<p>Compatible browsers:</p>
<ul>
    <li>Google Chrome 14</li>
    <li>Mozilla Firefox 7</li>
    <li>Opera 11</li>
    <li>Internet Explorer 9 (<a href="http://www.wewantogg.com">no sound</a>)</li>
</ul>
            </article>
        </td>
        <td id="middle" width="50%" valign="top">
            <article>
<h1>Sign in with OpenID</h1>
<p>You need an <a href="<?=site_url('help/invitation')?>">invitation</a> for this to work. What is <a href="<?=site_url('help/openid')?>">OpenID</a>?</p>
<form id="openid" method="post" action="<?=site_url('login/openid')?>">
</form>
            </article>
        </td>
        <td id="right" width="25%" valign="top">
            <article>
<h1>Anonymous user</h1>
<form method="post" action="<?=site_url('login/anonymous')?>">
<input type="submit" value="Sign in anonymously">
</form>
<p class="strike">Note: anonymous users may only view existing rooms.</p>
            </article>
        </td>
    </tr>
</table>
<?php require("layout_end.php"); ?>
