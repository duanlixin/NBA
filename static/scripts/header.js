(function() {

    var dropdown = $('.dropdown-list-btn');

    dropdown.on('click', function() {
        var self = $(this);
        self.find('ul').slideToggle('fast');

        $('#drop-arrow').toggleClass('dropup-arrow');

    });

    $('.nav-menu li').hover(
        function () {
            $(this).addClass('cur');
        },
        function () {
            $(this).removeClass('cur');
        }
    );

    $('.senond-item').hover(
        function () {
            $(this).addClass('nav-hover');
        },
        function () {
            $(this).removeClass('nav-hover');
        }
    );

    $('.dropdown-list-btn li').hover(
        function () {
            $(this).addClass('store-hover');
        },
        function () {
            $(this).removeClass('store-hover');
        }
    );
})();