// http://163.23.175.5/LIB/LibList.aspx?year=104&semi=2

/**
var scriptTag = document.createElement("script"),
    firstScriptTag = document.getElementsByTagName("script")[0]; 
scriptTag.src = 'http://localhost/blogger-data/blog-pulipuli-info-data-2017/04/console-webpage-crawler/database-of-high-school-library.js'; 
scriptTag.id = "webcrawler";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); 

*/

/**
main = function (_callback) {
   
    var _data = [{
            "a": 1,
            "b": 2,
            "c": 3,
            "E": 3,
        },
        {
            "a": 1,
            "D": 2,
            "c": 3,
        },
        {
            "F": 1,
            "a": 1,
            "b": 2,
            "c": 3,
        }];
    
    // -------------------------------------------------------
    _callback(_data);
};

 */

var WEBCRAWLER = {};

WEBCRAWLER.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
WEBCRAWLER.alphabet_array = WEBCRAWLER.alphabet.split("");

WEBCRAWLER.get_alphabet_col = function (_col) {
    var _key = "";
    var _is_over = false;
    
    while (_col > WEBCRAWLER.alphabet_array.length - 1) {
        _is_over = true;
        //console.log("over");
        var _i = _col % WEBCRAWLER.alphabet_array.length;
        var _v = WEBCRAWLER.alphabet_array[(_i)];
        _key = _v + _key;
        _col = (_col-_i) / WEBCRAWLER.alphabet_array.length;
    }

    var _i = _col % WEBCRAWLER.alphabet_array.length;
    if (_is_over === true) {
        _v = WEBCRAWLER.alphabet_array[(_i-1)];
    }
    else {
        _v = WEBCRAWLER.alphabet_array[(_i)];
    }
    
    _key = _v + _key;
    
    return _key;
};

WEBCRAWLER.convert_json_array_to_array = function (_json_array) {
    
    var _key_array = [];
    var _value_array = [];
    
    for (var _i = 0; _i < _json_array.length; _i++) {
        var _line = [];
        var _j = 0;
        for (var _key in _json_array[_i]) {
            var _key_index = $.inArray(_key, _key_array);
            if ($.inArray(_key, _key_array) === -1) {
                _key_array.push(_key);
                _key_index = _key_array.length-1;
            }
            
            var _value = _json_array[_i][_key];
            _line[_key_index] = _value;
            if (_key_index !== _j) {
                _line[_j] = undefined;
            }
            _j++;
        }
        
        _value_array.push(_line);
    }
    
    // -------------------------------
    
    for (var _i = 0; _i < _value_array.length; _i++) {
        for (var _j = 0; _j < _key_array.length; _j++) {
            if (typeof(_value_array[_i][_j]) === "undefined") {
                _value_array[_i][_j] = undefined;
            }
        }
        //_array.push(_value_array[_i]);
    }
    
    // -------------------------------
    
    var _array = [];
    _array.push(_key_array);
    for (var _i = 0; _i < _value_array.length; _i++) {
        _array.push(_value_array[_i]);
    }
    
    return _array;
};

WEBCRAWLER.save_to_ods = function (_data) {
    // https://pulipulichen.github.io/jieba-js/xlsx.core.min.js
    
    if (typeof(XLSX) === "undefined") {
        $.getScript("https://pulipulichen.github.io/blog-pulipuli-info-data-2017/04/console-webpage-crawler/xlsx.core.min.js", function () {
        //$.getScript("xlsx.core.min.js", function () {
            $.getScript("https://pulipulichen.github.io/blog-pulipuli-info-data-2017/04/console-webpage-crawler/FileSaver.js", function () {
            //$.getScript("FileSaver.js", function () {
                WEBCRAWLER.save_to_ods(_data);
            });
        });
        return;
    }
    
    // --------------------
    
    if( Object.prototype.toString.call( _data[0] ) !== '[object Array]' ) {
        _data = WEBCRAWLER.convert_json_array_to_array(_data);
    }
    
    //console.log(_data);return;
    
    // --------------------
    
    var _sheet = {};
    var _sheet_cells = {};
    
    var _max_col_number = 0;
    for (var _row = 0; _row < _data.length; _row++) {
        if (_data[_row].length-1 > _max_col_number) {
            _max_col_number = _data[_row].length-1;
        }
        
        for (var _col = 0; _col < _data[_row].length; _col++) {
            var _key = WEBCRAWLER.get_alphabet_col(_col);
            
            _key = _key + (_row+1);
            
            var _value = _data[_row][_col];
            _sheet_cells[_key] = { v: _value };
        }
    }
    
    var _last_cell = WEBCRAWLER.get_alphabet_col(_max_col_number) + "" + _data.length;
    _sheet["!ref"] = "A1:" + _last_cell;
    for (var _key in _sheet_cells) {
        _sheet[_key] = _sheet_cells[_key];
    }
    
    // --------------------
    
    var workbook = {
        SheetNames: ['data'],
        Sheets: {
            'data': _sheet
        }
    };
    
    //console.log(_sheet);return;
    
    // -------------------------------------------
    
    /* bookType can be 'xlsx' or 'xlsm' or 'xlsb' or 'ods' */
    var _bookType = "xlsx";
    var wopts = { bookType:_bookType, bookSST:false, type:'binary' };

    var wbout = XLSX.write(workbook,wopts);

    /* the saveAs call downloads a file on the local machine */
    var _title = document.title;
    var today = new Date();
    today = today.toISOString().substring(0, 10);
    _title = _title + " (" + today + ")";
    
    saveAs(new Blob([WEBCRAWLER.s2ab(wbout)],{type:"application/octet-stream"}), _title + "." + _bookType);
};

WEBCRAWLER.s2ab = function (s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!==s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
};

WEBCRAWLER.ajax_from_url = function (_url, _callback) {
    $.ajax({
        url: _url,
        type: 'GET',
        success: function(res) {
           var data = $.parseHTML(res);  //<----try with $.parseHTML().
           _callback($(data));
        }
    });
};

WEBCRAWLER.get_text_by_selector = function (_doc, _selector) {
    if (_doc.find(_selector).length === 1) {
        return _doc.find(_selector).text().trim();
    }
    else if (_doc.find(_selector).length > 1) {
        var _output = [];
        _doc.find(_selector).each(function (_i, _ele) {
            _output.push($(_ele).text());
        });
        return _output.join(";");
    }
};

WEBCRAWLER.get_int_by_selector = function (_doc, _selector) {
    var _text = WEBCRAWLER.get_text_by_selector(_doc, _selector);
    if (_text === undefined) {
        return _text;
    }
    _text = _text.replace(",", "");
    return parseInt(_text, 10);
};

WEBCRAWLER.show_progression_lock = false;

WEBCRAWLER.show_progression = function (_current, _total) {
    if (typeof(_current) === "number" 
            && typeof(_total) === "number" 
            && WEBCRAWLER.show_progression_lock === false) {
        WEBCRAWLER.show_progression_lock = true;
        //console.log([_current, _total]);
        if (_current === 0) {
            _current = 0.01;
        }
        var _percent = _current / _total;
        if (_percent > 1) {
            _percent = 1;
        }
        _percent = _percent * 100;
        _percent = Math.ceil(_percent);
        console.log("LOADING: " + _percent + "%");
        
        setTimeout(function () {
            WEBCRAWLER.show_progression_lock = false;
        }, 1000);
    }
};

WEBCRAWLER.init = function () {
    
    // ---------------------------------------------

    // 先偵測有沒有jQuery
    if (typeof($) !== "function") {
        (function(document, tag) {
            if (document.getElementById("jquery") === null) {
                var scriptTag = document.createElement(tag), // create a script tag
                    firstScriptTag = document.getElementsByTagName(tag)[0]; // find the first script tag in the document
                scriptTag.src = 'https://code.jquery.com/jquery-3.2.1.min.js'; // set the source of the script to your script
                scriptTag.id = "jquery";
                firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); // append the script to the DOM
            }

            setTimeout(function () {
                //$.getScript($("#webcrawler_lib").attr("src"));
                WEBCRAWLER.init();
            }, 1000);
        }(document, 'script'));
    }   // if (typeof($) !== "function") {
    else {
        if (typeof(main) === "function") {
            if (typeof(crawl_target_url) === "string"
                    && crawl_target_url !== location.href) {
                if (window.confirm("You are not stay in target URL: \n\n" + crawl_target_url + "\n\nDo you want to go to target URL?")) {
                    location.href = crawl_target_url;
                }
                return;
            }

            console.log("開始讀取");
            main(function (_data) {
                console.log("讀取完成");
                WEBCRAWLER.save_to_ods(_data);

            });
        }
    }   //else {
};

WEBCRAWLER.init();