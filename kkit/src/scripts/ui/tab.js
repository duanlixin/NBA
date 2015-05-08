define(function (require, exports, module) {
    var $ = require('jquery');

    var defaultOpts = {
        curClass: '',
        curDefaultIndex: 0,
        switchEventName: 'mouseenter'
    };

    //TODO:tab跟tabview可以添加自动识别兄弟节点模式，减少class

    /**
     * Tab
     * opts字段说明：
     * @param tabClass  选项卡className
     * @param viewClass 选项卡对应的视图className，可以为null
     * @param curClass  选中tab的className
     * @param curDefaultIndex   默认选中的tab索引
     * @param switchEventName   tab切换监听的事件名
     * @param onChangeFn   tab切换回调
     * @constructor
     */
    var Tab = function (opts) {
        this.tabClass = opts.tabClass;
        this.viewClass = opts.viewClass;
        this.curClass = opts.curClass || defaultOpts.curClass;
        this.curDefaultIndex = opts.curDefaultIndex || defaultOpts.curDefaultIndex;
        this.switchEventName = opts.switchEventName || defaultOpts.switchEventName;
        this.onChangeFn = opts.onChangeFn;

        this.elTabs;
        this.elViews;

        this._init();
    };

    Tab.prototype = {
        _init: function () {
            this._getElTabs();
            this._getElViews();
            this._switchTab(this.curDefaultIndex);
            this._eventBind();
        },
        _getElTabs: function () {
            //if (this.elTabs === undefined ||
            //    (this.elTabs && this.elTabs.length === 0)) {
                return this.elTabs = $('.' + this.tabClass);
            //}
            //
            //return this.elTabs;
        },
        _getElViews: function () {
            //if (this.viewClass === undefined) {
            //    return null;
            //}
            //
            //if (this.elViews === undefined ||
            //    (this.elViews && this.elViews.length === 0)) {
                return this.elViews = $('.' + this.viewClass);
            //}
            //
            //return this.elViews;
        },
        _switchTab: function (index) {
            var elTabs = this._getElTabs();
            var elViews = this._getElViews();

            elTabs.removeClass(this.curClass);
            elTabs.eq(index).addClass(this.curClass);
            if (elViews) {
                elViews.hide();
                elViews.eq(index).show();
            }
        },
        _eventBind: function () {
            var self = this;
            var tabSelector = '.' + self.tabClass;

            $(document).on(this.switchEventName, tabSelector, function (e) {
                var index = $(this).index(tabSelector);
                self._switchTab(index);

                if (typeof self.onChangeFn === 'function') {
                    self.onChangeFn(index, $(this), self.elViews.eq(index));
                }
            });
        }
    };

    module.exports = {
        init: function(opts) {
            return new Tab(opts);
        },
        setDefaultOpts: function(opts) {
            for(var key in defaultOpts) {
                var inputValue = opts[key];
                if (inputValue) {
                    defaultOpts[key] = inputValue;
                }
            }
        }
    };
});
