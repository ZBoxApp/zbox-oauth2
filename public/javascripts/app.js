/**
 * Created by enahum on 10/19/15.
 */
var $ = jQuery = require('jquery');
require('jquery-backstretch');

$(document).ready(function() {
    var body = $('body');
    if(body.data('page') == 'login') {
        body.addClass("account boxed separate-inputs");
        $.backstretch(["images/collaborate-and-learn.jpg", "images/collaboration_solution1.jpg", "images/collaboration_solution2.jpg"],
            {
                fade: 600,
                duration: 4000
            });
    }
});