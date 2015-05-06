define(function (require, exports, module) {
    var $ = require('jquery');
    var vote = require('ui/vote');

    // 单选投票
    var sigleVote = vote.createVote(vote.voteId.SIGLE, new vote.NOLogin());
    sigleVote.getVote(function (data, self, loginType) {
        // 出现错误
        if (data === null || data.code !== 0) {

            return;
        }
    });

    //var answer = {
    //    "312680": {
    //        "selected": [
    //            "733273"
    //        ]
    //    }
    //}
    //
    //sigleVote.postVote(answer);

    // 多选投票
    var multiVote = vote.createVote(vote.voteId.MULTI, new vote.NOLogin());
    multiVote.getVote(function (data, self, loginType) {
        // 出现错误
        if (data === null || data.code !== 0) {

            return;
        }
    });

    module.exports = {};
});
