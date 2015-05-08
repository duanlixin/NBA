define(function (require, exports, module) {
    var $ = require('jquery');
    var global = require('global');

    var Scroll = function (wrapperID) {
        var elWrapper = $('#' + wrapperID);

        this.elWrapper = elWrapper;
        this.elScrollWrapper = elWrapper.find('.scroll-wrapper');
        this.elScroll = elWrapper.find('.scroll-inner');
        this.elItems;
        this.elBtnL = elWrapper.find('.btn-left-disabled');
        this.elBtnR = elWrapper.find('.btn-right-disabled');

        this.width;     // 可视区域宽度
        this.scrollWidth;   // 滚动列表宽度
        this.data;      // load的数据
        this.length;    // 滚动列表项目数
        this.index;     // 可视区域最左边的列表项索引
        this.childIndex;        // 列表项内部翻页时的索引
        this.itemPages = {};    // 宽度大于可视区域的列表项页数
        this.lock;      // this.lock = true时使_goto失效
        this.atEnd;     // this.atEnd = true时时_next()失效
        this._init();
    }

    Scroll.prototype = {
        _init: function () {
            this.width = this.elScrollWrapper.width();
            this.scrollWidth = 0;
            this.length === 0;
            this.index = 0;
            this.childIndex = 0;
            this.lock = true;
            this.elScroll.css('left', '0');
            this._btnReset();
            this._load();
        },
        _goto: function (index, childIndex) {
            if (this.lock) {
                return;
            }
            this.lock = true;

            var self = this;
            var elItem = this.elItems.eq(index);
            var targetPos = elItem.position().left + childIndex * this.width;
            var maxPos = elItem.position().left + elItem.width();
            var distance = this.scrollWidth - targetPos;

            // 滚动边界检查
            if (distance < this.width) {
                targetPos = this.scrollWidth - this.width;
                this.atEnd = true;
            } else {
                if (targetPos > maxPos) {
                    targetPos = maxPos;
                }
                this.atEnd = false;
            }

            this.elScroll.animate({'left': -targetPos}, 'normal', 'swing', function () {
                self.childIndex = childIndex;
                self.index = index;
                self.lock = false;
                self._btnReset();
            });
        },
        _next: function () {
            if (this.atEnd) {
                return;
            }
            var index = this.index;
            var childIndex = this.childIndex;
            var itemPages = this.itemPages[index];

            if (itemPages && childIndex < itemPages - 1) {
                childIndex += 1;
            } else {
                index += 1;
                childIndex = 0;
            }

            this._goto(index, childIndex);
        },
        _prev: function () {
            if (this.index === 0) {
                return;
            }
            var index = this.index;
            var childIndex = this.childIndex;
            var itemPages = this.itemPages[index];

            if (itemPages && childIndex > 0) {
                childIndex -= 1;
            } else {
                index -= 1;
                itemPages = this.itemPages[index];
                if (itemPages) {
                    childIndex = itemPages - 1;
                } else {
                    childIndex = 0;
                }
            }

            this._goto(index, childIndex);
        },
        _btnReset: function() {
            var leftClass = 'btn-left';
            var rightClass = 'btn-right';
            if (this.index === 0) {
                leftClass += '-disabled';
            }
            if (this.atEnd) {
                rightClass += '-disabled';
            }

            this.elBtnL.attr('class', leftClass);
            this.elBtnR.attr('class', rightClass);

        },
        _load: function () {
            var self = this;
            var width = this.width;
            var height = this.elScrollWrapper.height();
            self.elScroll.html(require('src/template/loading').render({width: width, height: height}));

            //$.ajax({
            //    type: 'GET',
            //    url: global.API.miniScoreBoard,
            //    type: 'json',
            //    success: function(data) {
            var data = {};
                    // TODO:返回数据结构有误的处理
                    self.elScroll.html(require('src/template/competitionSched').render(data));
                    self.elWrapper.find('a').attr('tabIndex', '-1');

                    // 添加DOM引用
                    self.elItems = self.elScroll.find('.daily');
                    self.elItems.each(function (index, item) {
                        var itemWidth = $(item).width();
                        var itemPages = Math.ceil(itemWidth / self.width);

                        self.scrollWidth += itemWidth;
                        if (itemPages > 1) {
                            self.itemPages[index] = itemPages;
                        }
                    });
                    self.length = self.elItems.length;

                    // 检查填充的DOM宽度是否超出elScrollWrapper宽度
                    if (self.scrollWidth > self.width) {
                        self.elScroll.width(self.scrollWidth);
                        self.lock = false;
                        self._btnReset();
                        self._eventBind();
                    }
                //},
                //error: function(e) {
                //    // 显示加载失败, 点击重试
                //}
            //});
        },
        _eventBind: function () {
            var self = this;

            self.elWrapper.on('click', '.btn-left', function (e) {
                self._prev();
                $(this).blur();
            });

            self.elWrapper.on('click', '.btn-right', function (e) {
                self._next();
                $(this).blur();
            });

            self.elWrapper.on('mouseenter', 'li', function (e) {
                var li = $(this);
                var hiddenPos = -li.find('table').height();

                if (li.attr('data-hasstat') !== undefined) {
                    var prevTimer = li.data('up-timer');
                    if (prevTimer && prevTimer !== 0) {
                        clearTimeout(prevTimer);
                    }

                    var timer = setTimeout(function () {
                        li.find('table').animate({'margin-top': hiddenPos}, 'fast');
                        li.data('up-timer', 0);
                    }, 60);

                    li.data('up-timer', timer);
                }
            });

            self.elWrapper.on('mouseleave', 'li', function (e) {
                var li = $(this);
                var visiblePos = 10;

                if (li.attr('data-hasstat') !== undefined) {
                    var prevTimer = li.data('up-timer');
                    if (prevTimer && prevTimer !== 0) {
                        clearTimeout(prevTimer);
                    }

                    var table = li.find('table');
                    setTimeout(function () {
                        if (parseInt(table.css('margin-top')) < visiblePos) {
                            table.animate({'margin-top': visiblePos}, 'fast');
                        }
                    }, 80);
                }
            });
        }
    }

    exports.init = function (wrapperID) {
        return new Scroll(wrapperID);
    }
});
