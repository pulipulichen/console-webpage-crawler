// http://163.23.175.5/LIB/LibList.aspx?year=104&semi=2

/** 本機測試用
var scriptTag = document.createElement("script"),
    firstScriptTag = document.getElementsByTagName("script")[0]; 
scriptTag.src = 'https://pulipulichen.github.io/blog-pulipuli-info-data-2017/04/console-webpage-crawler/config/database-of-high-school-library.js'; 
scriptTag.id = "webcrawler";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); 
*/

crawl_target_url = "http://163.23.175.5/LIB/LibList.aspx?year=104&semi=2";
main = function (_callback) {
    var _data = [];
    
    var _link_array = [];
    
    // 先抓縣市別吧
    var _district_element = $('#tbList tr[height="50"]');
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
            _d["縣市別 district"] = _district;
            _d["學校名稱 school_name"] = _school_name;
            //http://163.23.175.5/LIB/LibView.aspx?10612
            _d["網頁連結 link"] = "http://163.23.175.5/LIB/" + _link;
            _link_array.push(_link);
            
            _data.push(_d);
            
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
    
    // -----------------------------------------------
    
    var _loop = function (_i) {
        if (_i < _link_array.length) {
            WEBCRAWLER.show_progression(_i, _link_array.length);
            var _link = _link_array[_i];
            _get_data_from_link(_link, function (_result) {
                for (var _key in _result) {
                    _data[_i][_key] = _result[_key];
                }
                
                _i++;
                _loop(_i);
            });
        }
        else {
            // -------------------------------------------------------
            //console.log(_data);
            _callback(_data);
        }
    };  // var _loop = function (_i) {
    _loop(0);
    
};

var _get_data_from_link = function (_link, _callback) {
    WEBCRAWLER.ajax_from_url(_link, function (_doc) {
        var _result = {};
        _result["校長 principal"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdPrincipal");
        _result["填報人 reporter"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdName");
        _result["圖書館主任 library_director"] = WEBCRAWLER.get_text_by_selector(_doc, "#txtDirectorName");
        
        var _address = WEBCRAWLER.get_text_by_selector(_doc, "#tdAddress");
        var _zipcode;
        if (_address !== undefined) {
            _zipcode = _address.split("]")[0];
            _zipcode = _zipcode.substring(1, _zipcode.length);
            
            _address = _address.split("]")[1].trim();
        }
        _result["學校郵遞區號 school_zip_code"] = _zipcode;
        _result["學校地址 school_address"] = _address;
        
        var _tel = WEBCRAWLER.get_text_by_selector(_doc, "#tdTel");
        var _tel_zip;
        if (_tel !== undefined) {
            _tel_zip = _tel.split(")")[0];
            _tel_zip = _tel_zip.substring(1, _tel_zip.length);
            //_tel = _tel.split(")")[1];
        }
        _result["學校電話區碼 tel_zip"] = _tel_zip;
        _result["學校電話 tel"] = _tel;
        _result["學校傳真 fax"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdFax");
        _result["學校郵件 mail"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdMail a");
        _result["學校網址 school_website"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdWeb1 a");
        _result["圖書館網址 library_website"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdWeb2 a");
        
        // --------------------------------------------------
        
        _result["核定班級數 class_count_approved"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdClasses1");
        _result["現有班級數 class_count_current"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdClasses2");
        _result["現有學生數 student_count_current"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdStudents2");
        _result["現有閱覽座位 seat_count_current"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdSeats");
        _result["圖書館員工數 librarian_count"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdStaffs");
        _result["主任人數  director_count"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdDirector");
        _result["組長人數 supervisor_count"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdSupervisor");
        _result["職員(含工友) staff_count"] = WEBCRAWLER.get_int_by_selector(_doc, "#tdStaff");
        
        _result["主任知能資格 director_qualification"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdKnowledge");
        
        // ---------------------------------------------
        
        _result["書籍冊數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td1");
        _result["圖書借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td2");
        
        _result["總類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td6");
        _result["總類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td7");
        
        _result["哲學類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td8");
        _result["哲學類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td9");
        
        _result["宗教類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td10");
        _result["宗教類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td11");
        
        _result["自然科學類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td12");
        _result["自然科學類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td13");
        
        _result["應用科學類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td14");
        _result["應用科學類借閱冊次："] = WEBCRAWLER.get_int_by_selector(_doc, "#Td15");
        
        _result["社會科學類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td16");
        _result["社會科學類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td17");
        
        _result["史地類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td18");
        _result["史地類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td19");
        
        _result["語文類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td20");
        _result["語文類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td21");
        
        _result["美術類"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td22");
        _result["美術類借閱冊次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td23");
                
        
        _result["圖書借閱人次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td3");
        _result["視聽資料總數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td4");
        _result["期刊報紙總類數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td5");
        _result["全校教職員人數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td24");
        _result["教職員借閱人次"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td25");
        _result["教職員借閱冊數"] = WEBCRAWLER.get_int_by_selector(_doc, "#Td26");
        
        _result["附註說明"] = WEBCRAWLER.get_text_by_selector(_doc, "#tdBody");
        
        _callback(_result);
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
    scriptTag.src = 'http://localhost/blogger-data/blog-pulipuli-info-data-2017/04/console-webpage-crawler/console-webpage-crawler-lib.js'; 
}
else {
    scriptTag.src = 'https://pulipulichen.github.io/blog-pulipuli-info-data-2017/04/console-webpage-crawler/console-webpage-crawler-lib.js'; 
}
scriptTag.id = "webcrawler_lib";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); 