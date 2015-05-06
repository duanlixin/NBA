define(function (require, exports, module) {
    var $ = require('jquery');

    var blocks = $('.new-warp');
    var loading = $('#news .load');
    var blockCount = blocks.length;
    var count = 1;

    $(window).scroll(function () {
        if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
            loading.show();
            setTimeout(function () {
                loading.hide();
                if (count <= blockCount) {
                    $(blocks[count++]).show();
                }
            }, 800);
        }
    });

});
