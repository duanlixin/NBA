/**
 * Date: 13-1-14
 * Time: 下午12:18
 */
define(function (require, exports) {
    var $ = require('zepto');
    var global = require('global');
    var modA = require('./ui/index/index');
    require('iSlider');
    $(function () {
        $('#schedule').html(require('src/template/schedule').render());
        $('#dataArea').html(require('src/template/dataArea').render());
        $('#album').html(require('src/template/banner').render());
        $('#news').html(require('src/template/news').render());
    });
});
