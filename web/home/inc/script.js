$(function() {
    // some css...
    $(":button,:submit").addClass("button");

    // making the accordions work
    (function() {
        $('dl.accordion > dt:first-child').next().show();
        $('dl.accordion > dt').click(function() {
            $('dl.accordion > dd').slideUp('fast');
            $(this).next().slideDown('fast');
        });
    })();

});
