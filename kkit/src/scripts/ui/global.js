/**
 * @describe: 全局使用的方法，业务逻辑等
 */
define(function (require, exports, module) {
    /*-----------------------------------------------------------------------
     所有HTTP API登记
     ----------------*/
    exports.API = {
        // 获取NBA排行榜的比赛数据
        teamRank: 'http://sportswebapi.qq.com/rank/team?competitionId=100000&from=1',
        // 今日得分排行
        todayRankPoint: 'http://mat1.gtimg.com/apps/hpage2/today_rank_point.json',
        // 赛季得分排行
        seasonRankPoint: 'http://mat1.gtimg.com/apps/hpage2/season_rank_point.json',
        // 今日篮板排行
        todayRankRebound: 'http://mat1.gtimg.com/apps/hpage2/today_rank_rebound.json',
        // 赛季篮板排行
        seasonRankRebound: 'http://mat1.gtimg.com/apps/hpage2/season_rank_rebound.json',
        // 今日助攻排行
        todayRankAssist: 'http://mat1.gtimg.com/apps/hpage2/today_rank_assist.json',
        // 赛季助攻排行
        seasonRankAssist: 'http://mat1.gtimg.com/apps/hpage2/season_rank_assist.json',
        // 今日盖帽排行
        todayRankBlock: 'http://mat1.gtimg.com/apps/hpage2/today_rank_block.json',
        // 赛季盖帽排行
        seasonRankBlock: 'http://mat1.gtimg.com/apps/hpage2/season_rank_block.json',
        // 今日抢断排行
        todayRankSteal: 'http://mat1.gtimg.com/apps/hpage2/today_rank_steal.json',
        // 赛季抢断排行
        seasonRankSteal: 'http://mat1.gtimg.com/apps/hpage2/season_rank_steal.json',
        // 获取投票题目 & 结果
        getVote: 'http://panshi.qq.com/v2/vote/{0}',
        // 提交投票
        postVote: 'http://panshi.qq.com/v2/vote/{0}/submit',
        // 获取投票结果
        getVoteResult: 'http://panshi.qq.com/v2/vote/{0}/result',
        // 迷你赛程表
        miniScoreBoard: 'http://china.nba.qq.com/static/data/scores/miniscoreboard.json',
    };
});
