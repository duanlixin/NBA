/**
 * 模板文件业务代码
 */
define(function (require, exports, module) {
    var _$ = require('jsonselect');  // 工具类
    var _g = require('global');  // 工具类
    var utils = require('utils/utils');
    var tpHelper = require('tpHelper'); // 用于模版模块生成的工具类，请慎重删除，___template___ 可能会用到
    var $ = require('jquery');

    module.exports = {
        init: function (sigleVote, data) {
            this.sigleVote = sigleVote;
            this.data = data;

            // 用户投过的subject
            var hasVotedSubjectId = $.cookie('hasVoted');
            if (!hasVotedSubjectId || hasVotedSubjectId !== data.data.subject[0].subjectid.toString()) {
                this.data.hasVoted = this.data.showResult = data.hasVoted = data.showResult = false;
            } else {
                this.data.hasVoted = this.data.showResult = data.hasVoted = data.showResult = true;
            }
        },
        submit: function (subjectId) {
            var subjectId = $("#subjectid").val();
            var selectedId = $("input:radio:checked").val();
            if (!selectedId) {
                return;
            }

            var answer = {};
            answer[subjectId] = {selected: []};
            answer[subjectId].selected.push(selectedId);

            var self = this;
            this.sigleVote.postVote(JSON.stringify(answer), null, null, null, null, function (data) {
                // 这个data里面没有数据
                if (data !== undefined) {
                    $.cookie('hasVoted', subjectId, {expires: 365});
                    self.data.hasVoted = true;
                    self.result(subjectId, true);
                }
            });
        },
        result: function (subjectId, showResult) {
            var self = this;
            this.sigleVote.getResult(function (data) {
                if (data !== null) {
                    data.showResult = self.data.showResult = showResult;
                    data.hasVoted = self.data.hasVoted;

                    for (var i = 0, len = data.data.subject[0].option.length; i < len; i++) {
                        self.data.data.subject[0].option[i].percent = data.data.subject[0].option[i].percent;
                        self.data.data.subject[0].option[i].selected = data.data.subject[0].option[i].selected;
                    }

                    var html = self.render(self.data);
                    if (data.hasVoted) {
                        $('#exForm').remove();
                        $('#ex-bd').append(html);
                    } else {
                        if ($('#ex-answer').length === 0) {
                            $('#exForm').append(html);
                        }

                        $('#ex-question, #btn-question').hide();
                        $('#ex-answer, #btn-answer').show();
                    }
                }
            });
        },
        render: function (data) {
            return ___template___(data);
        }
    }
});
