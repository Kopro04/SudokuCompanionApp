var cursor = 1;
var image = null;
var imgLoc = "images/splash_screen/Sprite";
var imgExt = ".png";

$(document).ready(function () {
    image = document.getElementById("sprite");
    spriteLoop();
    blink();

    $('#body').on('click', function (event) {
        window.location = "vertical_menu.html";
    });
});

function spriteLoop() {
    setTimeout(function () {
        image.src = imgLoc + cursor + imgExt;
        cursor++;
        if (cursor > 47) cursor = 0;
        spriteLoop();
    }, 700);
}

function blink() {
    $('#message').fadeOut(550).fadeIn(550, blink);
}