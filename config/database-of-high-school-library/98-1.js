crawl_target_url = "http://163.23.175.5/LIB/LibList.aspx?year=98&semi=1";
var DEBUG = {
    use_local_file: true,
    limit_one: false
};

// 使用方法說明
// https://docs.google.com/document/d/19L9VSWMbowvhe2cF8Lg4cNIlDh2aondT0gMLoGnjOF8/pub
// [JS_URL] = https://pulipulichen.github.io/console-webpage-crawler/config/database-of-high-school-library/105-2.js
// 分析結果希望儲存成的表格
// https://docs.google.com/spreadsheets/d/1n1WICaolF3wW_0usKsoyY4C3RqtDt7a1VKVUmzGL_7Q/edit
// a0_ 不能分析的類別資料，但要拿來參考
// a1_ 不能分析的類別資料
// a2_ 可以分析的類別資料
// b_ 校園統計：學校不能控制的連續資料
// bl_ 校園統計比較：學校不能控制的連續資料，跟前一期比較
// c_ 資源分配：學校對圖書館的規劃
// cl_ 資源分配比較：學校對圖書館的規劃，跟前一期比較
// c2_ 不能分析的資源分配：學校對圖書館的規劃
// d_ 圖書用量：圖書館使用狀況
// dl_ 圖書用量比較：圖書館使用狀況，跟前一期比較
// e_ 用量統計：額外統計的資料
// el_ 用量統計比較：額外統計的資料，跟前一期比較

// 主任知能資格 對應表
DIRECTOR_QUALIFICATION = {
    // 1
    "其他。": 1,
    // 2
    "具有中等學校合格教師資格普持有圖書館科加科登記證明者。": 2,
    // 3
    "國內外大學畢業，並曾修習圖書館專門科目(含在職進修專班、推廣教育學分班)二十學分以上者，或參加經主管教育行政機關核准或委託之圖書館、大專校院、圖書館專業團體辦理之圖書館專間科目修習二十學分以上者。所稱專門科目學分，由各大學校院認定，如認定有困難者，得送請主管教育行政機關認定之。": 3,
    // 4
    "國內外大學畢業，並有圖書館專門學科論著經公開出版及曾任公立或經主管教育行機關許可設立之私立圖書館三年以上之專業工作經驗者。": 4,
    // 5
    "國內外大學校院圖書館本科系、所或相關學系、所畢業者。所稱本科系、所或相關系所，由各高級中學認定，如認定有困難者，得送請主管教育行育行政機關認定之。": 5,
    // 6
    "國家公務人員高等考試暨普通考試圖書資訊管理類科(含圖書館類科)及格；或相當高等考試暨普通考之特種考試圖書資訊管理類科(含圖書館類科)特考及格，並取得任用資格者。": 6,
};

SCHOOL_ABBR = {};


main = function (_callback) {
    
    // 偵測有沒有載入高職名單，如果沒有的話，那就先載入高職名單再說
    if (typeof(VOC_LIST) === "undefined") {
        _load_voc_list(function () {
            _load_remote_zip_list(function () {
                _load_public_private_list(function () {
                    main(_callback);
                });
            });
        });
        return;
    }
    
    // --------------------------------------------------
    _get_last_data(function (_last_data) {
        
        _get_current_data(_last_data, function (_data) {
            _callback(_data);
        });
    });
};

var _get_last_data = function (_callback) {
    
    // 要先決定上一次的網址
    // crawl_target_url
    // http://163.23.175.5/LIB/LibList.aspx?year=105&semi=1
    var _p = WEBCRAWLER.parse_url_parameters(crawl_target_url);
    if (_p["semi"] === 1) {
        _p["semi"] = 2;
        _p["year"] = _p["year"] - 1;
    }
    else {
        _p["semi"] = 1;
    }
    var _last_url = "http://163.23.175.5/LIB/LibList.aspx?year=" + _p["year"] + "&semi=" + _p["semi"];
    //console.log(_last_url);
    WEBCRAWLER.ajax_from_url(_last_url, function (_doc) {
        var _district_element = _doc.find('#tbList tr[height="50"]');
        //console.log(_district_element.length);
        
        var _data = [];

        var _link_array = [];

        // 先抓縣市別吧
        _parse_district_element(_district_element, _data, _link_array, _p);

        // -----------------------------------------------

        WEBCRAWLER.loop(_link_array, function (_i, _link, _next) {
            _get_data_from_link(_link, function (_result) {
                for (var _key in _result) {
                    _data[_i][_key] = _result[_key];
                }
                WEBCRAWLER.show_progression(_i, _link_array.length);
                _next();
            });
        }, function () {
            var _last_data = {};
            for (var _i = 0; _i < _data.length; _i++) {
                var _d = _data[_i];
                var _key = _d["a1_學校全名"];
                _last_data[_key] = _d;
            }
            _callback(_last_data);
        });
    });
        
};

var _get_current_data = function (_last_data, _callback) {
    var _p = WEBCRAWLER.parse_url_parameters(crawl_target_url);
    
    var _data = [];
    
    var _link_array = [];
    
    // 先抓縣市別吧
    var _district_element = $('#tbList tr[height="50"]');
    _parse_district_element(_district_element, _data, _link_array, _p);
    
    // -----------------------------------------------
    
    WEBCRAWLER.loop(_link_array, function (_i, _link, _next) {
        _get_data_from_link(_link, _last_data, function (_result) {
            for (var _key in _result) {
                _data[_i][_key] = _result[_key];
            }
            WEBCRAWLER.show_progression(_i, _link_array.length);
            _next();
        });
    }, function () {
        _callback(_data);
    });
};

var _parse_district_element = function (_district_element, _data, _link_array, _p) {
    // 先抓縣市別吧
    for (var _i = 0; _i < _district_element.length; _i++) {
        var _tr = _district_element.eq(_i);
        //var _d = {};
        
        //_d["縣市別"] = $(_tr).find("td:first").text().split("(")[0].trim();
        var _district = $(_tr).find("td:first").text().split("(")[0].trim();
        
        var _a_element = $(_tr).find("td:last a");
        for (var _j = 0; _j < _a_element.length; _j++) {
            var _a = _a_element.eq(_j);
            var _school_name = _a.text().trim();
            var _link = _a.attr("href");
            
            var _d = {};
            _d["a2_學年度學期"] = parseInt(_p["year"] + "" + _p["semi"], 10);
            _d["a2_縣市別"] = _district;
            _d["a0_學校名稱"] = _school_name;
            //http://163.23.175.5/LIB/LibView.aspx?10612
            _d["a1_網頁連結"] = "http://163.23.175.5/LIB/" + _link;
            _link_array.push(_link);
            
            _data.push(_d);
            
            SCHOOL_ABBR[_link] = _d["a0_學校名稱"];
            
            // 測試用
            if (DEBUG.limit_one === true) {
                break;
            }
        };
        
        // 測試用
        if (DEBUG.limit_one === true) {
            break;
        }
        
        //_data.push(_d);
    };
};

var _get_data_from_link = function (_link, _last_data, _callback) {
    if (typeof(_last_data) === "function") {
        _callback = _last_data;
        _last_data = undefined;
    }
    
    WEBCRAWLER.ajax_from_url(_link, function (_doc) {
        var _result = {};
        
        _result["a1_學校全名"] = WEBCRAWLER.get_text_by_selector(_doc, "#divTitle > h3").split("：")[0];
        
        
        //取得學校全名之後，判斷是否是高職
        _result["a2_是高職"] = "否";
        _result["a1_高職名單"] = "";
        //console.log([_result["a1_學校全名"], VOC_LIST_INDEX[_result["a1_學校全名"]], SCHOOL_ABBR[_link], VOC_LIST_INDEX[SCHOOL_ABBR[_link]]]);
        if (typeof(NOT_VOC_LIST_INDEX[_result["a1_學校全名"]]) !== "undefined" 
                || typeof(NOT_VOC_LIST_INDEX[SCHOOL_ABBR[_link]]) !== "undefined") {
            _result["a2_是高職"] = "不是高職";
            _result["a1_高職名單"] = _result["a1_學校全名"];
        }
        else if (typeof(VOC_LIST_INDEX[_result["a1_學校全名"]]) !== "undefined" 
                || typeof(VOC_LIST_INDEX[SCHOOL_ABBR[_link]]) !== "undefined") {
            _result["a2_是高職"] = "是高職";
            _result["a1_高職名單"] = _result["a1_學校全名"];
        }
        else {
            var _name1 = _result["a1_學校全名"];
            var _name3 = SCHOOL_ABBR[_link];
            for (var _i = 0; _i < VOC_LIST.length; _i++) {
                var _name2 = VOC_LIST[_i];
                if (_name1.indexOf(_name2) > -1 
                        || _name2.indexOf(_name1) > -1
                        || _name3.indexOf(_name2) > -1 
                        || _name2.indexOf(_name3) > -1) {
                    _result["a2_是高職"] = "是高職？";
                    _result["a1_高職名單"] = _name2;
                }
            }
        }
        
        // ------------------------
        
        _result["a1_校長"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdPrincipal");
        _result["a1_填報人"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdName");
        _result["a1_圖書館主任"] = WEBCRAWLER.get_text_by_selector(_doc, "#txtDirectorName");
        
        var _address = WEBCRAWLER.get_text_by_selector(_doc, "#tdAddress");
        var _zipcode;
        if (_address !== undefined) {
            _zipcode = _address.split("]")[0];
            _zipcode = _zipcode.substring(1, _zipcode.length);
            
            _address = _address.split("]")[1].trim();
        }
        _result["a2_學校郵遞區號"] = _zipcode;
        
        // 判斷郵遞區號是否為偏鄉
        _result["a2_郵遞區號是偏鄉"] = "否";
        var _z = _zipcode.toString();
        if (_z.length > 3) {
            _z = _z.substr(0,3);
        }
        if (typeof(REMOTE_ZIP_LIST_INDEX[_z]) !== "undefined") {
            _result["a2_郵遞區號是偏鄉"] = "是";
        }
        
        _result["a2_學校地址"] = _address;
        
        var _tel = WEBCRAWLER.get_text_by_selector(_doc, "#tdTel");
        var _tel_zip;
        if (_tel !== undefined) {
            _tel_zip = _tel.split(")")[0];
            _tel_zip = _tel_zip.substring(1, _tel_zip.length);
            //_tel = _tel.split(")")[1];
        }
        _result["a2_學校電話區碼"] = _tel_zip;
        _result["a1_學校電話"] = _tel;
        _result["a1_學校傳真"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdFax");
        _result["a1_學校郵件"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdMail a");
        _result["a1_學校網址"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdWeb1 a");
        _result["a1_圖書館網址"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdWeb2 a");
        
        _result["a2_公私立分類"] = "不確定";
        if (typeof(PUBLIC_LIST_INDEX[_result["a1_學校電話"]]) !== "undefined") {
            _result["a2_公私立分類"] = "公立";
        }
        else if (typeof(PRIVATE_LIST_INDEX[_result["a1_學校電話"]]) !== "undefined") {
            _result["a2_公私立分類"] = "私立";
        }
        
        // --------------------------------------------------
        
        _result["b_核定班級數"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdClasses1");
        _result["b_現有班級數"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdClasses2");
        _result["e_現有減核定班級數"] = _result["b_現有班級數"] - _result["b_核定班級數"];
        _result["b_現有學生數"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdStudents2");
        _result["e_每班平均學生數"] = _result["b_現有學生數"] / _result["b_現有班級數"];
        
        var _student_count = _result["b_現有學生數"];
        var _staff_count = WEBCRAWLER.get_int_by_selector(_doc, "#Td24");
        var _member_count = _student_count + _staff_count;
        
        _result["c_現有閱覽座位"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdSeats");
        _result["c_圖書館員工數"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdStaffs");
        _result["e_平均圖書館員工服務員生數"] = _member_count / _result["c_圖書館員工數"];
        _result["c_主任人數"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdDirector");
        _result["c_組長人數"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdSupervisor");
        _result["c_職員_含工友"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdStaff");
        
        _result["c2_主任知能資格"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdKnowledge");
        _result["c_主任知能資格_代號"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdKnowledge");
        if (typeof(DIRECTOR_QUALIFICATION[_result["c_主任知能資格_代號"]]) !== "undefined") {
            _result["c_主任知能資格_代號"] = DIRECTOR_QUALIFICATION[_result["c_主任知能資格_代號"]];
        }
        
        // ---------------------------------------------
        
        _result["c_書籍冊數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td1");
        _result["e_每人平均書籍冊數"] = _result["c_書籍冊數"] / _member_count;
        _result["d_圖書借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td2");
        _result["e_每人平均圖書借閱冊次"] = _result["d_圖書借閱冊次"] / _member_count;
        
        _result["c_總類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td6");
        _result["e_每人平均總類冊數"] = _result["c_總類"] / _member_count;
        _result["d_總類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td7");
        _result["e_總類每人平均借閱冊次"] =  _result["d_總類借閱冊次"] / _member_count;
        
        _result["c_哲學類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td8");
        _result["e_每人平均哲學類冊數"] = _result["c_哲學類"] / _member_count;
        _result["d_哲學類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td9");
        _result["e_哲學類每人平均借閱冊次"] =  _result["d_哲學類借閱冊次"] / _member_count;
        
        _result["c_宗教類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td10");
        _result["e_每人平均宗教類冊數"] = _result["c_宗教類"] / _member_count;
        _result["d_宗教類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td11");
        _result["e_宗教類每人平均借閱冊次"] =  _result["d_宗教類借閱冊次"] / _member_count;
        
        _result["c_自然科學類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td12");
        _result["e_每人平均自然科學類冊數"] = _result["c_自然科學類"] / _member_count;
        _result["d_自然科學類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td13");
        _result["e_自然科學類每人平均借閱冊次"] =  _result["d_自然科學類借閱冊次"] / _member_count;
        
        _result["c_應用科學類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td14");
        _result["e_每人平均應用科學類冊數"] = _result["c_應用科學類"] / _member_count;
        _result["d_應用科學類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td15");
        _result["e_應用科學類每人平均借閱冊次"] =  _result["d_應用科學類借閱冊次"] / _member_count;
        
        _result["c_社會科學類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td16");
        _result["e_每人平均社會科學類冊數"] = _result["c_社會科學類"] / _member_count;
        _result["d_社會科學類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td17");
        _result["e_社會科學類每人平均借閱冊次"] =  _result["d_社會科學類借閱冊次"] / _member_count;
        
        _result["c_史地類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td18");
        _result["e_每人平均史地類冊數"] = _result["c_史地類"] / _member_count;
        _result["d_史地類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td19");
        _result["e_史地類每人平均借閱冊次"] =  _result["d_史地類借閱冊次"] / _member_count;
        
        _result["c_語文類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td20");
        _result["e_每人平均語文類冊數"] = _result["c_語文類"] / _member_count;
        _result["d_語文類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td21");
        _result["e_語文類每人平均借閱冊次"] =  _result["d_語文類借閱冊次"] / _member_count;
        
        _result["c_美術類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td22");
        _result["e_每人平均美術類冊數"] = _result["c_美術類"] / _member_count;
        _result["d_美術類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td23");
        _result["e_美術類每人平均借閱冊次"] = _result["d_美術類借閱冊次"] / _member_count;
                
        
        _result["d_圖書借閱人次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td3");
        _result["e_平均借閱人數"] = _result["d_圖書借閱人次"] / _member_count;
        _result["c_視聽資料總數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td4");
        _result["e_每人平均視聽資料總數"] = _result["c_視聽資料總數"] / _member_count;
        _result["c_期刊報紙總類數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td5");
        _result["e_每人平均期刊報紙總類數"] = _result["c_期刊報紙總類數"] / _member_count;
        _result["b_全校教職員人數"] = _staff_count;
        _result["d_教職員借閱人次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td25");
        _result["e_平均教職員借閱人次"] = _result["d_教職員借閱人次"] / _staff_count;
        _result["d_教職員借閱冊數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td26");
        _result["e_平均教職員借閱冊數"] = _result["d_教職員借閱冊數"] / _staff_count;
        
        _result["b_全校教職員生人數"] = _member_count;
                
        _result["a1_附註說明"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdBody");
        
        // -----------------------------
        
        var _ld = {};
        if (_last_data !== undefined 
                && typeof(_last_data[_result["a1_學校全名"]]) !== "undefined") {
            _ld = _last_data[_result["a1_學校全名"]];
            
            var _l_result = {};
            for (var _key in _result) {
                
                var _l_key = _key + "_l";
                if (typeof(_ld[_key]) === "undefined" && typeof(_result[_key]) === "undefined") {
                    console.log("兩年都缺乏資料：" + _result["a1_學校全名"] + "/" + _key);
                    _l_result[_l_key] = "缺乏兩年資料";
                    continue;
                }
                if (typeof(_ld[_key]) === "undefined") {
                    console.log("_ld缺乏資料2：" + _result["a1_學校全名"] + "/" + _key);
                    _l_result[_l_key] = "缺乏上一年資料";
                    continue;
                }
                if (typeof(_result[_key]) === "undefined") {
                    console.log("_result缺乏資料：" + _result["a1_學校全名"] + "/" + _key);
                    _l_result[_l_key] = "缺乏今年資料";
                    continue;
                }
                var _c = _result[_key];
                var _l = _ld[_key];
                
                var _value = _l;
                if (isNaN(_c) === true) {
                    // 類別資料
                    if (_c === _l) {
                        _value = "相同";
                    }
                }
                else {
                    _value = _c - _l;
                }
                _l_result[_l_key] = _value;
            }
            
            // ---------------------------------------------------------------
            
            //console.log(_ld);
            for (var _l_key in _l_result) {
                _result[_l_key] = _l_result[_l_key];
            }
        }
        
        _callback(_result);
    });
};

/**
 * 載入高職名單
 */
var _load_voc_list = function (_callback) {
    $.getScript(_voc_list_url, function () {
        VOC_LIST_INDEX = {};
        for (var _i = 0; _i < VOC_LIST.length; _i++) {
            var _ary = VOC_LIST[_i];
            if (typeof(_ary) !== "object") {
                _ary = [_ary];
            }
            for (var _j = 0; _j < _ary.length; _j++) {
                VOC_LIST_INDEX[_ary[_j]] = true;
            }
            
        }
        
        NOT_VOC_LIST_INDEX = {};
        for (var _i = 0; _i < NOT_VOC_LIST.length; _i++) {
            NOT_VOC_LIST_INDEX[NOT_VOC_LIST[_i]] = true;
        }
        //console.log(VOC_LIST_INDEX);
        //console.log(VOC_LIST);

        _callback();
    });
};


/**
 * 載入高職名單
 */
var _load_remote_zip_list = function (_callback) {
    $.getScript(_remote_list_url, function () {
        REMOTE_ZIP_LIST_INDEX = {};
        for (var _i = 0; _i < REMOTE_ZIP_LIST.length; _i++) {
            var _z = REMOTE_ZIP_LIST[_i].toString();
            REMOTE_ZIP_LIST_INDEX[_z] = true;
        }
        _callback();
    });
};

/**
 * 載入高職名單
 */
var _load_public_private_list = function (_callback) {
    $.getScript(_pubpri_list_url, function () {
        PUBLIC_LIST_INDEX = {};
        for (var _i = 0; _i < PUBLIC_LIST.length; _i++) {
            var _z = PUBLIC_LIST[_i].toString();
            PUBLIC_LIST_INDEX[_z] = true;
        }
        
        PRIVATE_LIST_INDEX = {};
        for (var _i = 0; _i < PRIVATE_LIST.length; _i++) {
            var _z = PRIVATE_LIST[_i].toString();
            PRIVATE_LIST_INDEX[_z] = true;
        }
        _callback();
    });
};


// ------------------------------------------------------------------------------
// 下面程式碼請不要變更

/** 本機測試用
var scriptTag = document.createElement("script"),
    firstScriptTag = document.getElementsByTagName("script")[0]; 
scriptTag.src = 'http://localhost/console-webpage-crawler/config/database-of-high-school-library/105-1.js';
scriptTag.id = "webcrawler";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); 
*/

var _lib_url = 'https://pulipulichen.github.io/console-webpage-crawler/console-webpage-crawler-lib.js'; 
var _voc_list_url = 'https://pulipulichen.github.io/console-webpage-crawler/config/database-of-high-school-library/voc_list_105.js'; 
var _remote_list_url = 'https://pulipulichen.github.io/console-webpage-crawler/config/database-of-high-school-library/remote_zip_list_105.js'; 
var _pubpri_list_url = 'https://pulipulichen.github.io/console-webpage-crawler/config/database-of-high-school-library/school_public_private_105.js'; 

if (DEBUG.use_local_file === true) {
    _lib_url = 'http://localhost/console-webpage-crawler/console-webpage-crawler-lib.js'; 
    _voc_list_url = 'http://localhost/console-webpage-crawler/config/database-of-high-school-library/voc_list_105.js'; 
    _remote_list_url = 'http://localhost/console-webpage-crawler/config/database-of-high-school-library/remote_zip_list_105.js'; 
    _pubpri_list_url = 'http://localhost/console-webpage-crawler/config/database-of-high-school-library/school_public_private_105.js'; 
}

var scriptTag = document.createElement("script"),
    firstScriptTag = document.getElementsByTagName("script")[0]; 
scriptTag.src = _lib_url; 
scriptTag.id = "webcrawler_lib";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); 