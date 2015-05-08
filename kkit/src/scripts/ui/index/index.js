define(function (require, exports, module) {
    var $ = require('jquery');
    var vote = require('ui/vote');

    /**
     * 数据专区
     */
    var dataAreaApi = [
        {
            today: 'http://mat1.gtimg.com/apps/hpage2/today_rank_point.json',
            season: 'http://mat1.gtimg.com/apps/hpage2/season_rank_point.json'
        },
        {
            today: 'http://mat1.gtimg.com/apps/hpage2/today_rank_rebound.json',
            season: 'http://mat1.gtimg.com/apps/hpage2/season_rank_rebound.json'
        },
        {
            today: 'http://mat1.gtimg.com/apps/hpage2/today_rank_assist.json',
            season: 'http://mat1.gtimg.com/apps/hpage2/season_rank_assist.json'
        },
        {
            today: 'http://mat1.gtimg.com/apps/hpage2/today_rank_block.json',
            season: 'http://mat1.gtimg.com/apps/hpage2/season_rank_block.json'
        },
        {
            today: 'http://mat1.gtimg.com/apps/hpage2/today_rank_steal.json',
            season: 'http://mat1.gtimg.com/apps/hpage2/season_rank_steal.json'
        }
    ], dataAreaData = [], tempNum = 0, tempObj = {};

    var getDataByAjax = function () {
        var self = arguments.callee;
        if (!self.hasLoading) {
            $('#mod-data').html(require('src/template/loading').render({
                width: $('#mod-data').width(),
                height: $('#mod-data').height()
            }));
            self.hasLoading = true;
        }

        // 获取今日排名
        $.ajax({
            type: 'get',
            url: dataAreaApi[tempNum].today,
            dataType: 'jsonp',
            jsonpCallback: 'dataLoadedBack',
            success: function (retToday) {
                // 获取赛季排名
                $.ajax({
                    type: 'get',
                    url: dataAreaApi[tempNum].season,
                    dataType: 'jsonp',
                    jsonpCallback: 'dataLoadedBack',
                    success: function (retSeason) {
                        tempObj.today = retToday;
                        tempObj.season = retSeason;
                        dataAreaData.push(tempObj);
                        tempObj = {};

                        tempNum++;

                        // 如果API还没有请求完，则递归请求，否则渲染模板
                        if (dataAreaApi[tempNum]) {
                            self();
                        } else {
                            $('#mod-data').html(require('template/dataArea').render(data));
                        }
                    }
                });
            }
        });
    }();


    $(function () {
        $("#newsList").html(require("template/newsList").render({})); //todo: 上线时删除
        /**
         * 获取NBA排行榜的比赛数据
         * @param params
         * @returns {*}
         */
        $('#mod-chart').html(require('src/template/loading').render({
            width: $('#mod-chart').width(),
            height: $('#mod-chart').height()
        }));
        $.ajax({
            url: 'http://sportswebapi.qq.com/rank/team?competitionId=100000&from=1',
            dataType: 'jsonp'
        }).done(function (data) {
            $('#mod-chart').html(require('template/rankNBA').render(data[1]));
        });


        // 获取投票题目&选项
        $("#ex-bd").html(require('src/template/loading').render({
            width: $("#ex-bd").width(),
            height: $("#ex-bd").height()
        }));

        var sigleVote = vote.createVote(vote.voteId.SIGLE, new vote.NOLogin());
        sigleVote.getVote(function (data, self, loginType) {
            if (data === null || data.code !== 0) {
                return;
            }

            var template = require('template/survey');
            template.init(sigleVote, data);
            $("#ex-bd").html(template.render(template.data));
            $("#ex-bd").on('click', '#sub', function () {
                template.submit(data.data.subject[0].subjectid);
            });
            $("#ex-bd").on('click', '#look', function () {
                template.result(data.data.subject[0].subjectid, true);
            });
            $("#ex-bd").on('click', '#back', function () {
                $('#ex-question, #btn-question').show();
                $('#ex-answer,#btn-answer').hide();
            });
        });
    });

    module.exports = {};
});
