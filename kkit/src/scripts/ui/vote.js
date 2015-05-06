define(function (require, exports, module) {
    // 接口域名：http://panshi.qq.com
    // 投票ID：单选10282406 多选10283226
    var $ = require('jquery');
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
            var opts = {source: ''};

            for (var key in this.login) {
                opts[key] = this.login[key];
            }

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
            var opts = {source: ''};
            opts.login = this.login.loginType;
            opts.answer = answer;
            opts.rank = rank;
            opts.score = score;
            opts.second = second;
            opts.panshiId = panshiId;

            // TODO:修改为iframe + form 提交
            $.ajax({
                type: 'POST',
                url: URL + '/v2/vote/' + this.voteId + '/submit',
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
         * 获取投票结果
         * @param fn 获取数据回调
         */
        getResult: function (fn) {
            var self = this;
            var opts = {source: ''};

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
