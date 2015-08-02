<?php require("layout_begin.php"); ?>

<h1>Frequently Asked Questions</h1>

<a name="whatis"></a>
<h2>What is this?</h2>
<p>Collaborative programming.</p>
<p>This is a collaborative web-based platform enabling users to rapidly prototype games. A group of people may enter this website, create a new room, and work together in order to create a game. All one needs is a modern browser: no download is required.</p>

<a name="demo"></a>
<h2>Are there any demos?</h2>
<p>Sure, <a href="<?=site_url('demos/')?>">check them out</a>!</p>

<a name="invitation"></a>
<h2>Why do I need an invitation?</h2>
<p>This platform is still in alpha stage of development. We're studying how people use this software and how our servers behave facing the user-generated traffic.</p>
<p>If you're feeling like an early adopter, we'll be glad to provide you an invitation. Please <a href="<?=site_url('help/contact')?>">get in touch</a> and ask.</p>

<a name="openid"></a>
<h2>What is OpenID?</h2>
<p>OpenID is a distributed identity system invented in 2005. One no longer needs to remember the passwords of hundreds of different registrations across multiple websites. Only one account is enough.</p>
<p>It's likely that you already have an OpenID and may not even know about it. Google, Yahoo!, AOL, Facebook, MySpace, Wordpress, Blogger, among others, are all OpenID providers. By authenticating on any of those websites, you'll already be authenticating on this service. Curious? Read <a href="http://openidexplained.com/?OIDCA=<?=base_url()?>">OpenID explained</a>.</p>
<p>If you don't want to use your account of any of the above websites, please consider signing up a new account at <a href="http://www.myopenid.com/">myopenid.com</a> instead.</p>

<a name="learn"></a>
<h2>How do I use this system?</h2>
<p>Please refer to the <a href="<?=site_url('help/learn')?>">learning center</a>.</p>

<a name="contact"></a>
<h2>How can I contact you?</h2>
<p>Please use the <a href="<?=site_url('help/contact')?>">contact page</a>.</p>

<?php require("layout_end.php"); ?>