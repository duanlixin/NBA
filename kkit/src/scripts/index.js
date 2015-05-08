define(function (require, exports) {
    require('jquery');
    require('global');
    require('lib/es5-shim');
    require('lib/jquery.cookie');

    $(function () {
        require('ui/header');
        require('ui/newshover');
        require('ui/index/index');
        require('ui/index/banner').init('index-scrollImg', 5000);
        require('ui/index/sched').init('index-sched');
        require('ui/loadnews');
        require('ui/tab').setDefaultOpts({
            curClass: 'cur',
            curDefaultIndex: 0,
            switchEventName: 'mouseenter'
        });

        // 首页视频Tab
        require('ui/tab').init({
            tabClass: 'tab-video',
            viewClass: 'tabview-video'
        });

        // 首页数据专区鼠标划过效果
        require('ui/tab').init({
            tabClass: 'tab-data',
            viewClass: 'tabview-data',
            onChangeFn: function(index, elTab, elView) {
                elView.find('.tab-prank-now').eq(0).trigger('mouseenter');
                elView.find('.tab-prank-all').eq(0).trigger('mouseenter');
            }
        });
        require('ui/tab').init({tabClass: 'tab-prank-now'});
        require('ui/tab').init({tabClass: 'tab-prank-all'});

        // 首页东西部排行榜鼠标划过效果
        require('ui/tab').init({
            tabClass: 'tab-trank',
            viewClass: 'tabview-trank'
        });
    });
});
