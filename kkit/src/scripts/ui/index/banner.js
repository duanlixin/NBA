define(function (require, exports, module) {
    var $ = require('jquery');

    /**
     * 焦点图轮播组件
     * @param elWrapper {DOM}
     * @param delay     {Number}     每张图运动时间间隔
     * @constructor
     */
    var FocusImages = function (containerID, delay) {
        var elWrapper = $('#' + containerID);
        this.elWrapper = elWrapper;
        this.elScroll = elWrapper.find('.scrollImg-content');
        this.elList = elWrapper.find('.scrollImg-content li');
        this.elNav = elWrapper.find('.scrollImg-nav');
        this.elPlayer = elWrapper.find('.playerWrapper');
        this.delay = delay || 5000;

        this.width;
        this.height;
        this.index; // 当前焦点图下标
        this.count; // 焦点图数量
        this.scrollWidth; // 滚动容器宽度
        this.stop;
        this.moving;
        this.timer;
        this.useAutoRun;
        this.player;
        this.isPlayerHide;

        this._init();
    }

    FocusImages.prototype = {
        _init: function () {
            if (this.elList.length === 0) {
                return;
            }

            this.width = this.elWrapper.width();
            this.height = this.elWrapper.height();
            this.index = 0;
            this.count = this.elList.length;
            this.timer = 0;
            this.scrollWidth = this.count * this.width;
            this.elList.find('img').width(this.width);
            this.elScroll.css({
                width: this.scrollWidth + 'px',
                left: 0
            });

            // 生成小圆点
            var elCircle = '';
            for (var i = 0, len = this.count; i < len; i++) {
                elCircle += '<li><a href="javascript:"></a></li>';
            }
            this.elNav.html(elCircle);
            this.elNav.find('a').eq(0).addClass('current');
            this.elWrapper.find('a').attr('tabIndex', '-1');

            // 把图片的链接拷贝到文字标题
            var links = this.elScroll.find('a');
            for (var j = 0, len = links.length; j < len; j++) {
                var href = links.eq(j).attr('href');
                if (href) {
                    links.eq(j + 1).attr('href', href);
                }
            }

            // 播放按钮
            var videoItem = this.elList.filter('[data-vid]');
            videoItem.append('<a class="btn-play" href="javascript:"></a>');

            this._eventBind();
        },
        /**
         * 移动到某张焦点图
         * @param order 目标焦点图的顺序
         * @private
         */
        _goto: function (order) {
            if (this.stop) {
                return;
            }

            if (this.useAutoRun) {
                // 当用户主动翻页时autoRun先停一下
                clearTimeout(this.timer);
                this.timer = 0;
                this.autoRun();
            }

            if (this.moving) {
                return;
            }
            this.moving = true;

            if (order < 0) {
                order = this.count + (order % this.count);
            }
            order = order % this.count;
            var self = this;
            var targetPos = -order * self.width;

            self.elScroll.animate({'left': targetPos}, 'fast', 'swing', function () {
                self.index = order;
                self.moving = false;
                self.elNav.find('a').removeClass('current');
                self.elNav.find('a').eq(order).addClass('current');
            });
        },
        _eventBind: function () {
            var self = this;

            this.elWrapper.on('mouseenter', function (e) {
                $('.scrollImg-prev, .scrollImg-next').show();
            });

            this.elWrapper.on('mouseleave', function (e) {
                $('.scrollImg-prev, .scrollImg-next').hide();
            });

            this.elWrapper.on('click', '.scrollImg-nav a', function (e) {
                var order = $(this).index('.scrollImg-nav a');
                self._goto(order);
            });

            this.elWrapper.on('click', '.scrollImg-prev', function (e) {
                self.prev();
            });

            this.elWrapper.on('click', '.scrollImg-next', function (e) {
                self.next();
            });

            this.elWrapper.on('click', '.btn-play', function (e) {
                var item = $(this).parents('li');
                var vid = $.trim(item.data('vid'));     // 点播ID
                var cid = $.trim(item.data('cid'));     // 直播ID
                var isLive = cid === '' ? false : true;

                // 如果不满足打开播放器的条件就直接跳转
                if (typeof tvp === 'undefined' || (vid === '' && cid === '')) {
                    var pageURL = item.find('a').eq(0).attr('href');
                    window.open(pageURL);
                    return;
                }

                var video = new tvp.VideoInfo();
                if (isLive) {
                    video.setChannelId(cid);
                } else {
                    video.setVid(vid);
                }

                self.isPlayerHide = false;
                if (self.player === undefined) {
                    var playerAdHeight = 35;
                    var videoParam = {
                        width: self.width,
                        height: self.height + playerAdHeight,
                        modId: self.elPlayer.attr('id'),
                        video: video,
                        flashWmode: 'Opaque',       // 使HTML能覆盖swf
                        isVodFlashShowNextBtn: false, // 是否显示下一个视频
                        isOcxHideControl: false,    // 是否显示控件
                        isVodFlashShowSearchBar: false, //是否显示搜索框
                        autoplay: true,
                        onplay: function () {
                            if (self.isPlayerHide === true) {
                                self.player.getPlayer().mute();
                            } else if (self.isPlayerHide === false) {
                                self.player.getPlayer().unmute();
                            }
                        }
                    };

                    isLive && (videoParam.type = 1);
                    var player = new tvp.Player();
                    player.create(videoParam);
                    self.player = player;
                } else {
                    self.player.play(video);
                }

                self.elPlayer.css('z-index', '3');
                self.stop = true;

                $(this).parents('.scrollImg').find('.btn-close').show();
            });

            this.elWrapper.on('click', '.btn-close', function (e) {
                self.isPlayerHide = true;
                self.player.pause();
                self.player.getPlayer().mute();
                self.elPlayer.css('z-index', '-1');
                self.stop = false;
                $(this).hide();

                if (self.useAutoRun) {
                    self.autoRun();
                }
            });

            this.elWrapper.on('click', 'a', function (e) {
                $(this).blur();
            });
        },
        next: function () {
            this._goto(this.index + 1);
        },
        prev: function () {
            this._goto(this.index - 1);
        },
        autoRun: function () {
            var self = this;
            this.useAutoRun = true;
            this.timer = setTimeout(function () {
                self.next();
            }, this.delay);
        }
    };

    if (typeof tvp === "undefined") {
        $.getScript("http://imgcache.gtimg.cn/tencentvideo_v1/tvp/js/tvp.player_v2.js");
    }

    exports.init = function (containerID, delay) {
        var banner = new FocusImages(containerID, delay);
        banner.autoRun();
        return banner;
    }
});
