define(function (require, exports, module) {
    var $ = require('jquery');

    var newsSlider = {
        init: function () {
            this.search();
            this.searchOut();
            this.newHover();
            this.chartString();
        },
        //点击默认搜索按钮，出现搜索框
        search: function () {
            $('#sc-btn').on('click', function () {
                $('#sc').addClass('sc');
            });
        },
        //阻止事件传播
        searchOut: function () {
            $(document).on('click', function (e) {
                var $target = $(e.target);
                if (!($target.is('#sc-txt,#sc-btn,#sc'))) {
                    $('#sc').removeClass('sc');
                }
            });
        },
        //新闻--鼠标移上的状态
        newHover: function () {
            $('.new-posi').mouseover(function () {
                $(this).children('.new').addClass('new-hover');
            }).mouseout(function () {
                $(this).children('.new').removeClass('new-hover');
            });
        },
        //新闻内容超出三行时截取字符，用省略号替代
        chartString: function () {
            $('.txt-chart').each(function () {
                var $txtH = $(this).height();
                var $p = $('.txt-con', $(this)).eq(0);
                while ($p.outerHeight() > $txtH) {
                    $p.text($p.text().replace(/(\s)*([a-zA-Z0-9]+|\W)(\.\.\.)?$/, '...'));
                }
            });
        }
    };

    newsSlider.init();
});
