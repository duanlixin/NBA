define(function (require, exports, module) {
    /*---------------------------------------
     备注：
     接口域名：http://panshi.qq.com
     投票ID：单选10282406 多选10283226
     接口BUG：
            1、即使没有登录态login也要传值且不要等于0，写死login = 1
            2、source参数也要写死为1
            3、需要传入g_tk参数

     ----------------------------------------*/

    var $ = require('jquery');
    var utils = require('utils/utils');
    var URL = "http://panshi.qq.com";
    var voteId = {
        SIGLE: 10282406,    // NBA官网单选id
        MULTI: 10283226     // NBA官网多选id
    };

    // 登录类型
    var loginType = {
        NONE: '0',      // 未登录
        QQ: '1',        // QQ登录
        WX: '2',        // 微信登录
        MQQ: '4',       // 手机QQ登录
        WEIBO: '5'      // 新浪微博登录
    };

    var NOLogin = function () {
        this.login = loginType.NONE;
    };

    var QQLogin = function (uin) {
        this.login = loginType.QQ;
        this.uin = uin
    };

    var WXLogin = function (openId, accessToken, appId) {
        this.login = loginType.WX;
        this.openId = openId;
        this.access_token = accessToken;
        this.appId = appId;
    };

    var MQQLogin = function (sid) {
        this.login = loginType.MQQ;
        this.sid = sid;
    };

    var WEIBOLogin = function (access_token, uid) {
        this.login = loginType.WEIBO;
        this.access_token = access_token;
        this.uid = uid;
    };

    /**
     * 投票对象
     * @param voteId 调查的全局唯一ID
     * @param login  登录对象
     * @constructor
     */
    var Vote = function (voteId, login) {
        this.voteId = voteId;
        this.login = login;
    };

    Vote.prototype = {
        /**
         * 获取投票题目
         * @param fn
         */
        getVote: function (fn) {
            var self = this;
            var opts = {
                g_tk: utils.generateToken(utils.getUkey()),
                source: '1'
            };

            //for (var key in this.login) {
            //    opts[key] = this.login[key];
            //}

            $.ajax({
                type: 'GET',
                url: URL + '/v2/vote/' + this.voteId,
                data: opts,
                dataType: 'jsonp',
                success: function (data) {
                    typeof fn === 'function' && fn(data, self, loginType);
                },
                error: function () {
                    typeof fn === 'function' && fn(null, self, loginType);
                }
            });
        },
        /**
         * 提交投票选项
         * @param answer
         * @param rank
         * @param score
         * @param second
         * @param panshiId
         * @param fn 提交完成回调
         */
        postVote: function (answer, rank, score, second, panshiId, fn) {
            var self = this;
            var opts = {
                g_tk: utils.generateToken(utils.getUkey()),
                source: '1'
            };
            opts.answer = answer;
            opts.rank = rank;
            opts.score = score;
            opts.second = second;
            opts.panshiId = panshiId;
            opts.login = 1;

            var poster = new utils.PostIframe({
                url: URL + '/v2/vote/' + this.voteId + '/submit',
                formData: opts,
                success: function () {
                    typeof fn === 'function' && fn({}, self, loginType);
                },
                error: function () {
                    typeof fn === 'function' && fn(null, self, loginType);
                }
            });

            poster.submit();
        },
        /**
         * 获取投票结果
         * @param fn 获取数据回调
         */
        getResult: function (fn) {
            var self = this;
            var opts = {
                g_tk: utils.generateToken(utils.getUkey()),
                source: '1'
            };

            // hack
            opts.login = 1;

            $.ajax({
                type: 'GET',
                url: URL + '/v2/vote/' + this.voteId + '/result',
                data: opts,
                dataType: 'jsonp',
                success: function (data) {
                    typeof fn === 'function' && fn(data, self, loginType);
                },
                error: function () {
                    typeof fn === 'function' && fn(null, self, loginType);
                }
            });
        }
    };

    module.exports = {
        Vote: Vote,
        voteId: voteId,
        loginType: loginType,
        NOLogin: NOLogin,
        QQLogin: QQLogin,
        WXLogin: WXLogin,
        MQQLogin: MQQLogin,
        WEIBOLogin: WEIBOLogin,
        createVote: function (voteId, login) {
            return new Vote(voteId, login);
        }
    };
});
