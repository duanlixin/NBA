define(function (require, exports, module) {
    var $ = require('jquery');

    // NBA商店图标
    var nbaStoreLogo = $('.dropdown-list-btn');
    // NBA商店下拉列表
    var nbaStoreList = nbaStoreLogo.find('ul');
    // NBA商店下拉项
    var nbaStoreItem = nbaStoreList.find('li');
    // NBA商店下拉小箭头
    var dropArrow = $('#drop-arrow');
    // 导航
    var nav = $('.nav-menu li');
    // 二级导航
    var secondItem = $('.senond-item');
    // 二级导航中的球队
    var team = $('.team-list td');

    // 点击NBA商店图标，NBA商店下拉列表显示/隐藏
    nbaStoreLogo.on('click', function () {
        nbaStoreList.slideToggle('fast');
        dropArrow.toggleClass('dropup-arrow');
    });

    // 点击非NBA商店图标和NBA商店下拉小箭头，隐藏NBA商店下拉列表
    $('body').on('click', function (evt) {
        var clickTarget = $(evt.target);

        if (!clickTarget.is(dropArrow) && !clickTarget.is(nbaStoreLogo)
            ) {
            nbaStoreList.hide('fast');
        }

    });

    // 封装hover事件
    function menuHover(ele, className) {
        ele.hover(
            function () {
                $(this).addClass(className);
            },
            function () {
                $(this).removeClass(className);
            }
        );
    }

    // NBA商店下拉项hover
    menuHover(nbaStoreItem, 'store-hover');
    // 导航hover
    menuHover(nav, 'cur');
    // 二级导航hover
    menuHover(secondItem, 'nav-hover');
    // 二级导航中的球队hover
    menuHover(team, 'team-hover');

});
