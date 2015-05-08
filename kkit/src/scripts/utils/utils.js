/**
 * @describe: 工具类 函数类工具集
 */
define(function (require, exports, module) {
    var $ = require('jquery');

    /**
     * 将字符串中的特殊字符转换为实体
     * @param {String} arr 待转换字符串
     * @return
     */
    var encodeHtml = function (str) {
        return (str + '').replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\x60/g, '&#96;')
            .replace(/\x27/g, '&#39;')
            .replace(/\x22/g, '&quot;');
    }

    /**
     * 将字符串中的实体转换为原字符
     * @param {String} arr 待转换字符串
     * @return
     */
    var decodeHtml = function (str) {
        return (str + '').replace(/&quot;/g, '\x22')
            .replace(/&#0*39;/g, '\x27')
            .replace(/&#0*96;/g, '\x60')
            .replace(/&gt;/g, '>')
            .replace(/&lt;/g, '<')
            .replace(/&amp;/g, '&');
    }

    /**
     * 字符串格式化
     * @param str
     * @returns {*}
     * @example
     * strFormat('http://localhost/{0}?id={1}', 'get', '111') // 返回http://localhost/get?id=111
     */
    var strFormat = function (str) {
        for (var i = 1, len = arguments.length; i < len; i++) {
            var reg = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(reg, arguments[i] || '');
        }
        return str;
    }

    /**
     * 获取字符串长度
     * @param  {String} str
     * @return {String}
     */
    var getStrLen = function (str) {
        var arr = (str || '').match(/[^\x00-\x80]/g);
        return str.length + (arr ? arr.length : 0);
    }

    /**
     * 按字符长度裁剪字符串
     * @param  {String}  str 原字符串
     * @return {number}  num 截取长度
     * @return {string}  replace 截取后填充字符
     * @example
     * cutStr('我是xiaom565', 4, '');    // 返回  '我是'
     * cutStr('daklfjsklafjas', 7, '');  // 返回  'daklfjs'
     */
    var cutStr = function(str, num, replace) {
        replace = replace ? replace : '...';
        var arrNew = [],
            strNew = '',
            arr,
            that = this,
            length = getStrLen(str);
        if (length > num) {
            arr = str.split('');
            $(arr).each(function(i, o) {
                if (num > 0) {
                    arrNew.push(o);
                    num -= getStrLen(o);
                } else {
                    return 1;
                }
            });
            strNew = arrNew.join('') + replace;
        } else {
            strNew = str;
        }
        return strNew;
    }

    /**
     * 特殊文本做自定义长度截断(可扩展更多特殊字符)
     * @param {String} str - 原始字串
     * @param {Number} len - 截取长度
     * @param {String} [tail = '...'] - 截取后尾部补充字串
     * @return {String} 截取后的字串
     */
    var cutText = function (str, len, tail) {
        // 单位长度的无显示占位符,为了保证区别，现只能为每种替换文本设定不同占位符
        // 不做成标记末尾式的原因是：无法替换1个长度的特殊文本
        var XX = ['\u0006', '\u0007', '\u0005'];

        var objs = [{
            // 特殊符号
            reg: /(&#38|&#39;|&#34;|&#60;|&#62;)/g,
            len: 1
        }, {
            reg: /<[^>]*>[^<>]*<\/[^>]*>/g,
            len: 1
        }];

        if (!str) {
            return;
        }

        if (!len) {
            return str;
        }

        tail = tail || '...';

        // 替换连续的空格为1个空格,再重新计算是否超出长度
        var replaceStr = str.replace(/\s+/g, ' ');
        if (getStrLen(replaceStr) <= len) {
            return replaceStr;
        }

        // 替换掉所有需要被替换的内容
        $.each(objs, function (i, d) {
            // d.arr 存放每个替换位原本的内容(如果有的话)
            d.arr = replaceStr.match(d.reg);
            if (d.arr && d.arr.length) {
                // 快速生成对应长度的占位字符，存入d.X
                d.X = (new Array(Math.floor(d.len) + 1)).join(':').replace(/:/g, XX[i]);
                // 全局替换
                replaceStr = replaceStr.replace(d.reg, d.X);
            }
        });

        // 完成特殊替换后，截取长度
        var afterCutStr = cutStr(replaceStr, len, tail);

        // 先把成对的标签替换回去
        var d = objs[2];
        while (true) {
            if (d.arr && d.arr.length && afterCutStr.search(d.X) !== -1) {
                afterCutStr = afterCutStr.replace(d.X, d.arr.shift());
            } else {
                break
            }
        }

        // 闭合双标签截断
        var reg = /(<[^>]*>)([^<>]*)(<\/[^>]*>)/;
        var regG = /<[^>]*>([^<>]*)<\/[^>]*>/g;

        var arr = afterCutStr.match(regG);
        var sArr = [];
        var plainStr = afterCutStr; // 去掉匹配标签只留内容的部分,以便截断用
        if (arr && arr.length) {
            $.each(arr, function (i, s) {
                s.match(reg)[1] && sArr.push({
                    head: s.match(reg)[1],
                    str: s.match(reg)[2],
                    tail: s.match(reg)[3]
                });
                plainStr = plainStr.replace(reg, ' $2 ');
            });

            afterCutStr = cutStr(plainStr, len);

            // 将截断后的无标签文本查找对应原标签内容，给加回标签去
            $.each(sArr, function (i, s) {
                afterCutStr = afterCutStr.replace(s.str, ' ' + s.head + s.str + s.tail + ' ');
            });
        }

        // 再替换回原本的内容
        $.each(objs, function (i, d) {
            while (true) {
                if (d.arr && d.arr.length && afterCutStr.search(d.X) !== -1) {
                    afterCutStr = afterCutStr.replace(d.X, d.arr.shift());
                } else {
                    break;
                }
            }
        });

        return afterCutStr;
    }

    var getUkey = function () {
        var d = +new Date();
        d = [d, Math.floor(d * Math.random() * Math.random()).toString().slice(-5)].join('');

        if (window.localStorage) {
            if (localStorage.ukey) {
                return localStorage.ukey;
            } else {
                //localStorage 写操作必须加try catch，可以统一弄个函数处理
                //不然可能会遇到溢出或safari无痕浏览写入就报错的问题
                try {
                    localStorage.ukey = d;
                } catch (e) {}
                return d;
            }
        } else {
            if ($.cookie('ukey')) {
                return $.cookie('ukey');
            } else {
                $.cookie('ukey', d, { expires: 365, path: '/' });
            }
        }
    };

    /**
     * TODO:此处可能需要修改为腾讯体育的计算方式
     * 用户Token
     * @return {number}
     */
    var generateToken = function (key) {
        var hash = 2013;
        if (key) {
            for (var i = 0, len = key.length; i < len; i++) {
                hash += (hash << 5) + key.charCodeAt(i);
            }
        }
        return hash & 0x7fffffff;
    };

    /*-----------------------------------------------------------------------
     跨域POST BEGIN
     ----------------*/

    /**
     * 跨域POST数据
     * @param url   {String} 接口URL
     * @param formData  {Object} key-value形式的对象，value为字符串（可选）
     * @param form  {DOM} 表单DOM（可选）
     * @param success {Function} 加载成功回调，参数formData为iframe返回内容
     * @param error   {Function} 加载失败回调
     * @constructor
     */
    var PostIframe = function (opts) {
        this.url = opts.url;
        this.formData = opts.formData;
        this.form = opts.form;
        this.success = opts.success;
        this.error = opts.error;
        this.timeout = opts.timeout || PostIframe.config.timeout;   // 暂未实现
        this.formInner = '';
        this.iframe;
    };

    // 默认配置
    PostIframe.config = {
        prefix: 'postiframe-',
        timeout: 10000
    };
    // Iframe队列
    PostIframe.iframeQueue = [];
    // Iframe包装对象
    PostIframe.Iframe = function (id, name) {
        this.el = $('<iframe id="' + id + '" name="' + name + '" style="display: none;"></iframe>');
        this.busy = false;
    };
    // 添加iframe
    PostIframe.addIframe = function () {
        var len = this.iframeQueue.length;
        var id = this.config.prefix + len;
        var name = id;
        var iframe = new this.Iframe(id, name);
        this.iframeQueue[len] = iframe;
        $('body').append(iframe.el);

        return iframe;
    };
    // 清理空闲iframe
    PostIframe.getIdle = function () {
        for (var i = 0, len = this.iframeQueue.length; i < len; i++) {
            var iframe = this.iframeQueue[i];
            if (!iframe.busy) {
                return iframe;
            }
        }

        return this.addIframe();
    };
    // 清理空闲iframe
    PostIframe.clearIdle = function () {
        for (var i = 0, len = this.iframeQueue.length; i < len; i++) {
            var iframe = this.iframeQueue[i];
            if (!iframe.busy) {
                iframe.el.off();
                iframe.el.remove();
            }
        }
    };
    PostIframe.initForm = function () {
        if (!this.elForm) {
            this.elForm = $('<form id="' + PostIframe.config.prefix + 'form" style="display: none"></form>');
            $('body').append(this.elForm);
        }

        return this.elForm;
    }

    PostIframe.prototype = {
        _getIframe: function () {
            this.iframe = PostIframe.getIdle();
            this.iframe.busy = true;
        },
        _releaseIframe: function () {
            this.iframe.busy = false;
            this.iframe = null;
            PostIframe.clearIdle();
        },
        _setForm: function (elForm) {
            var value = '';
            for (var key in this.formData) {
                value = this.formData[key];
                if (value !== undefined || value !== null) {
                    value = encodeHtml(value);
                    this.formInner += '<input type="text" name="' + key + '" value="' + value + '">';
                }
            }

            elForm.html(this.formInner);
        },
        /**
         * 提交表单
         * @param form {DOM}
         */
        submit: function (form) {
            // 准备一个空闲的iframe
            this._getIframe();

            if (form === undefined) {
                form = PostIframe.initForm();
                this._setForm(form);
            }

            var self = this;
            form = $(form);
            form.attr({
                method: 'POST',
                action: self.url,
                target: self.iframe.el.attr('name')
            });

            this.iframe.el.off('load');
            this.iframe.el.off('error');
            this.iframe.el.on('load', function (e) {
                // 额，暂时不考虑同域能获取到数据的情况吧
                self.success();
                // 释放iframe
                self._releaseIframe();
            });

            this.iframe.el.on('error', function (e) {
                self.error();
                self._releaseIframe();
            });

            form.submit();
        }
    };

    /*-----------------------------------------------------------------------
     跨域POST END
     ----------------*/

    module.exports = {
        encodeHtml: encodeHtml,
        decodeHtml: decodeHtml,
        strFormat: strFormat,
        getStrLen: getStrLen,
        cutStr: cutStr,
        cutText: cutText,
        getUkey: getUkey,
        generateToken: generateToken,
        PostIframe: PostIframe
    };
});
