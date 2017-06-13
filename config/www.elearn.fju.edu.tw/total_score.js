// http://www.elearn.fju.edu.tw/ican5/Course/Dashboard.aspx?cno=10521000CNM103C1003248299
// 巨量資料探勘與統計應用 30 > 成績 > 總成績管理 | 總成績管理	

// 使用方法說明
// https://docs.google.com/document/d/19L9VSWMbowvhe2cF8Lg4cNIlDh2aondT0gMLoGnjOF8/pub
// [JS_URL] = https://pulipulichen.github.io/console-webpage-crawler/database-of-high-school-library/105-1.js

crawl_target_url = "http://163.23.175.5/LIB/LibList.aspx?year=105&semi=1";
main = function (_callback) {
    /**
     * 裡面存放JSON
     * @type Array
     */
    var _data = [];
    
    $("#ctl00_cph1_ucMag_Panel3 table tbody tr.detailover").each(function (_i, _tr) {
        var _td_array = $(_tr).children("td.detailtd");
        
        var _result = {
            "系級": WEBCRAWLER.remove_duplicate_space(_td_array.eq(3).text()),
            "學號": WEBCRAWLER.remove_duplicate_space(_td_array.eq(4).text()),
            "姓名": WEBCRAWLER.remove_duplicate_space(_td_array.eq(5).text()),
            "作業成績": WEBCRAWLER.parseNumber(_td_array.eq(6).text()),
            "考試成績": WEBCRAWLER.parseNumber(_td_array.eq(7).text()),
            "總成績": WEBCRAWLER.parseNumber(_td_array.eq(10).text()),
        };
        _data.push(_result);
    });
    
    // 回傳資料
    _callback(_data);
};

// ------------------------------------------------------------------------------
// 下面程式碼請不要變更

/** 本機測試用
var scriptTag = document.createElement("script"),
    firstScriptTag = document.getElementsByTagName("script")[0]; 
scriptTag.src = 'http://localhost/blogger-data/blog-pulipuli-info-data-2017/04/console-webpage-crawler/config/database-of-high-school-library.js'; 
scriptTag.id = "webcrawler";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); 
*/

var DEBUG = {
    use_local_file: false,
    limit_one: false
};

var scriptTag = document.createElement("script"),
    firstScriptTag = document.getElementsByTagName("script")[0]; 
if (DEBUG.use_local_file === true) {
    scriptTag.src = 'http://localhost/console-webpage-crawler/console-webpage-crawler-lib.js'; 
}
else {
    scriptTag.src = 'https://pulipulichen.github.io/console-webpage-crawler/console-webpage-crawler-lib.js'; 
}
scriptTag.id = "webcrawler_lib";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); 