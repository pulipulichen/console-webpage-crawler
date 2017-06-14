// http://www.elearn.fju.edu.tw/ican5/Course/Dashboard.aspx?cno=10521000CNM103C1003248299
// http://203.72.29.166/search/index.php?no=2&page=1
// http://203.72.29.166/search/index.php?no=2&page=18

// 使用方法說明
// https://docs.google.com/document/d/19L9VSWMbowvhe2cF8Lg4cNIlDh2aondT0gMLoGnjOF8/pub
// [JS_URL] = https://pulipulichen.github.io/console-webpage-crawler/config/203.72.29.166/vocedu.js

/*
var scriptTag = document.createElement("script"),
    firstScriptTag = document.getElementsByTagName("script")[0];
scriptTag.src = 'https://pulipulichen.github.io/console-webpage-crawler/config/203.72.29.166/vocedu.js';
scriptTag.id = "webcrawler";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
 */

crawl_target_url = "http://203.72.29.166/search/index.php?no=2";
main = function (_callback) {
    /**
     * 裡面存放JSON
     * @type Array
     */
    var _data = [];
    
    // ---------------------------------------
    // 準備網址
    
    var _url_array = [];
    //for (var _i = 1; _i < 19; _i++) {
    for (var _i = 1; _i < 2; _i++) {
        _url_array.push("http://203.72.29.166/search/index.php?no=2&page=" + _i);
    }
    
    // ----------------------------------------
    
    WEBCRAWLER.loop(_url_array, function (_i, _url, _cb) {
        WEBCRAWLER.ajax_from_url(_url, function (_doc) {
            _doc.find("#school-list table").each(function (_j, _table) {
                var _row = {};
                $(_table).find("li").each(function (_k, _li) {
                    var _value = $(_li).text().trim();
                    var _key = "學校全名";
                    if (_k === 1) {
                        _key = "地址";
                        
                        // 包含了郵遞區號嗎？
                        if (_value.indexOf("[") > -1) {
                            var _parts = _value.split("]");
                            _value = _parts[1].trim();
                            var _zip = _parts[0].substr(1);
                            
                            _row["郵遞區號"] = _zip;
                        }
                    }
                    else if (_k === 2) {
                        _key = "電話";
                    }
                    else if (_k === 3) {
                        _key = "網址";
                    }
                    
                    _row[_key] = _value;
                });
                _data.push(_row);
            });
            
            for (var _j = 0; _j < _scholl_list_table_array.length; _j++) {
                var _li_array = _scholl_list_table_array.eq(_j).find("li");
                
            }
            
            WEBCRAWLER.show_progression(_i, _url_array.length);
            _cb();
        });
    }, function () {
        // 回傳資料
        _callback(_data);
    });
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