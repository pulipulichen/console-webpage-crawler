// http://www.elearn.fju.edu.tw/ican5/Course/Dashboard.aspx?cno=10521000CNM103C1003248299
// http://203.72.29.166/search/index.php?no=2&page=1
// http://203.72.29.166/search/index.php?no=2&page=18

// 使用方法說明
// https://docs.google.com/document/d/19L9VSWMbowvhe2cF8Lg4cNIlDh2aondT0gMLoGnjOF8/pub
// [JS_URL] = https://pulipulichen.github.io/console-webpage-crawler/config/203.72.29.166/vocedu.js

/*
var scriptTag = document.createElement("script"),
    firstScriptTag = document.getElementsByTagName("script")[0];
scriptTag.src = 'http://localhost/console-webpage-crawler/config/203.72.29.166/vocedu.js';
scriptTag.id = "webcrawler";
firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
 */

SCHOOL_LIST_TEL = undefined;
SCHOOL_LIST_HOST = undefined;
SCHOOL_LIST_ZIP = undefined;
NUMBER_LIST = "0123456789";
SAVED_SCHOOL = {};
CSV_matched_count = 0;
CSV_NAME_LIST = {};

NAME_DICT = {
   "國立高餐大附屬餐旅中學": "高餐大附中",
   "新竹縣立六家高中": "六家高中",
   "宜蘭縣立慈心華德福教育實驗高級中學": "慈心華德福",
   "臺北市立大同高級中學": "市立大同高中"
};

crawl_target_url = "http://203.72.29.166/search/index.php?no=2";
main = function (_callback) {
    /**
     * 裡面存放JSON
     * @type Array
     */
    var _data = [];
    
    // ---------------------------------------
    // 先取得所需要的資料
    if (SCHOOL_LIST_TEL === undefined) {
        SCHOOL_LIST_TEL = {};
        SCHOOL_LIST_HOST = {};
        SCHOOL_LIST_ZIP = {};
        _load_school_list(function () {
            main(_callback);
        });
        return;
    }
    
    // ---------------------------------------
    // 準備網址
    
    var _url_array = [];
    var _url_dict = {
        "1": {
            "no": 1,
            "name": "高中",
            "pages": 36
        },
        "2": {
            "no": 2,
            "name": "高職",
            "pages": 18
        },
        "3": {
            "no": 3,
            "name": "Smith",
            "pages": 5
        },
        "4": {
            "no": 4,
            "name": "綜合高中",
            "pages": 9
        },
        "5": {
            "no": 5,
            "name": "進修部_進修學校",
            "pages": 21
        },
        "6": {
            "no": 6,
            "name": "七年一貫制",
            "pages": 1
        }
        
        /*
        "2": {
            "no": 2,
            "name": "高職",
            "pages": 18
        }
        */
    };
    for (var _i in _url_dict) {
    //for (var _i = 1; _i < 2; _i++) {
        var _d = _url_dict[_i];
        for (var _j = 1; _j < _d.pages+1; _j++) {
            _url_array.push("http://203.72.29.166/search/index.php?no=" + _d.no + "&page=" + _j);
        }
    }
    //console.log(_url_array);
    // ----------------------------------------
    
    //return;
    
    WEBCRAWLER.loop(_url_array, function (_i, _url, _cb) {
        WEBCRAWLER.ajax_from_url(_url, function (_doc) {
            var _no = eval(_url.substr(_url.indexOf("?no=") + 4, 1));
            var _class = _url_dict[_no].name;
            
            _doc.find("#school-list table").each(function (_j, _table) {
                var _row = {
                    //"學校類別": _class
                };
                $(_table).find("li").each(function (_k, _li) {
                    _li = $(_li);
                    if (_li.find("a:first").length > 0) {
                        _li = _li.find("a:first");
                    }
                    var _value = _li.text().trim();
                    if (_value === "" || _value === undefined) {
                        return;
                    }
                    
                    var _key = "學校全名";
                    if (_k === 0) {
                        if (typeof(NAME_DICT[_value]) === "string") {
                            _row["學校簡稱"] = NAME_DICT[_value];
                        }
                        if (typeof(SAVED_SCHOOL[_value]) === "undefined") {
                            SAVED_SCHOOL[_value] = _data.length;
                            _row["學校類別_" + _class] = true;
                        }
                        else {
                            var _i = SAVED_SCHOOL[_value];
                            _data[_i]["學校類別_" + _class] = true;
                            return;
                        }
                    }
                    else if (_k === 1) {
                        _key = "地址";
                        
                        // 包含了郵遞區號嗎？
                        if (_value.indexOf("[") > -1) {
                            var _parts = _value.split("]");
                            _value = _parts[1].trim();
                            var _zip = _parts[0].substr(1);
                            
                            _row["郵遞區號5碼"] = _zip;
                            var _zip3 = _zip.substr(0, 3);
                            _row["郵遞區號3碼"] = _zip3;
                        }
                        else if (_value.indexOf("(") > -1) {
                            var _parts = _value.split(")");
                            _value = _parts[1].trim();
                            var _zip = _parts[0].substr(1);
                            
                            _row["郵遞區號5碼"] = _zip;
                            var _zip3 = _zip.substr(0, 3);
                            _row["郵遞區號3碼"] = _zip3;
                        }
                        else if (_value.indexOf(" ") > -1) {
                            var _parts = _value.split(" ");
                            _value = _parts[1].trim();
                            var _zip = _parts[0].substr(1);
                            
                            _row["郵遞區號5碼"] = _zip;
                            var _zip3 = _zip.substr(0, 3);
                            _row["郵遞區號3碼"] = _zip3;
                        }
                        else {
                            // 試著抓抓看地址吧
                            var _zip = "";
                            var _i = 0;
                            while (NUMBER_LIST.indexOf(_value.substr(_i,1)) > -1) {
                                _zip = _zip + _value.substr(_i,1);
                                _i++;
                            }
                            
                            if (_zip.length > 2) {
                                _row["郵遞區號5碼"] = _zip;
                                var _zip3 = _zip.substr(0, 3);
                                _row["郵遞區號3碼"] = _zip3;
                            }
                            else {
                                _row["郵遞區號5碼"] = _zip;
                                _row["郵遞區號3碼"] = _zip;
                            }
                            
                            _value = _value.substring(_i, _value.length);
                        }
                    }
                    else if (_k === 2) {
                        _key = "篩選電話";
                        
                        var _tel = _value;
                        _row["電話"] = _tel;
                        var _parts = _value.split("-");
                        var _zip = _parts[0].trim();
                        _row["電話區碼"] = _zip;
                        
                        if (_value.indexOf("轉") > -1) {
                            _value = _value.substr(0, _value.indexOf("轉"));
                        }
                        if (_value.indexOf("#") > -1) {
                            try {
                                _value = _value.substr(0, _value.indexOf("#"));
                            }
                            catch (e) {
                                console.log(["找不到#", _tel]);
                            }
                        }
                        
                        _value = _value.split("-").join("");
                    }
                    else if (_k === 3) {
                        _key = "網址";
                        
                        var _url_parts = _value.split("/");
                        if (_url_parts.length < 2) {
                            //console.log(["網址有問題", _value]);
                            _row["網域"] = _value;
                        }
                        else if (_url_parts[2].indexOf(".") > 0) {
                            var _host = _url_parts[2].trim();
                            _row["網域"] = _host;
                        }
                    }
                    
                    _row[_key] = _value;
                });
                
                if (typeof(_row["學校簡稱"]) === "undefined") {
                    var _matched = false;
                    var _matched_name = "";
                    // 比對一下結果
                    if (typeof(SCHOOL_LIST_TEL[_row["篩選電話"]]) !== "undefined") {
                        _row["電話_學校簡稱"] = SCHOOL_LIST_TEL[_row["篩選電話"]];
                        _matched_name = SCHOOL_LIST_TEL[_row["篩選電話"]];
                        _matched = true;
                    }
                    else {
                        _row["電話_學校簡稱"] = "";
                    }
                    if (_matched === false 
                            && typeof(SCHOOL_LIST_HOST[_row["網域"]]) !== "undefined") {
                        _row["網域_學校簡稱"] = SCHOOL_LIST_HOST[_row["網域"]];
                        _matched_name = SCHOOL_LIST_HOST[_row["網域"]];
                        _matched = true;
                    }
                    else {
                        _row["網域_學校簡稱"] = "";
                    }
                    
                    _row["學校簡稱"] = _matched_name;
                }
                
                if (_row["學校簡稱"] !== "") {
                    CSV_matched_count++;
                    CSV_NAME_LIST[_row["學校簡稱"]] = true;
                }
                _row["page"] = _url;
                //if (_matched === false) {
                //    console.log(['找不到', JSON.stringify(_row)]);
                //}
                
                _data.push(_row);
            });
            
            WEBCRAWLER.show_progression(_i, _url_array.length);
            _cb();
        });
    }, function () {
        console.log(["找到結果", CSV_matched_count, CSV_count]);
        var _not_found = [];
        for (var _name in CSV_NAME_LIST) {
            if (CSV_NAME_LIST[_name] === false) {
                _not_found.push(_name);
            }
        }
        console.log(["沒有找到的學校", _not_found]);
        // 回傳資料
        _callback(_data);
    });
};

CSV_count = 0;
var _load_school_list = function (_callback) {
    var _doc = SCHOOL_LIST_CSV;
        var _lines = _doc.trim().split("\n");
        for (var _l = 1; _l < _lines.length; _l++) {
            var _fields = _lines[_l].split(",");
            
            CSV_count++;
            var _name = _fields[0].trim();
            CSV_NAME_LIST[_name] = false;
            
            var _tel_array = _fields[1].trim().split(";");
            // (04)25686850 <-> 05-2264264
            for (var _j = 0; _j < _tel_array.length; _j++) {
                var _tel = _tel_array[_j].trim();
                if (_tel.indexOf("(") === 0) {
                    _tel = _tel.substring(1, _tel.length);
                    _tel = _tel.split(")").join("");
                }
                _tel = _tel.split("-").join('');
                SCHOOL_LIST_TEL[_tel] = _name;
            }
            
            var _url = _fields[2].trim();
            var _url_parts = _url.split("/");
            if (_url_parts[2].indexOf(".") > 0) {
                _url = _url_parts[2].trim();
            } 
            var _zip = _fields[3].trim();
            
            SCHOOL_LIST_HOST[_url] = _name;
            //if (typeof(SCHOOL_LIST_ZIP[_zip]) !== "undefined") {
            //    alert(["重複ZIP:", _zip, _name]);
            //}
            SCHOOL_LIST_ZIP[_zip] = _name;
        }
        
        _callback();
};

SCHOOL_LIST_CSV = "學校簡稱,學校電話,學校網址,學校郵遞區號\n大甲高工,(04)26874132,http://www.tcvs.tc.edu.tw,437\n大甲高中,(04)26877165,http://www.djsh.tc.edu.tw/,437\n大明高中,(04)24821027,http://www.tmsh.tc.edu.tw/,412\n中科實驗中學,(04)25686850,http://www.nehs.tc.edu.tw/,428\n中港高中,(04)26578270,http://www.cgsh.tc.edu.tw/,435\n市立大里高中,(04)24067870,http://www.dlsh.tc.edu.tw/,412\n弘文高中,(04)25340011,http://www.hwhs.tc.edu.tw/,427\n玉山高中,(04)25771313,http://www.yssh.tc.edu.tw/,423\n立人高中,(04)24834138,http://www.lzsh.tc.edu.tw/,412\n光華高工,(04)23949009,http://www.khvs.tc.edu.tw,411\n后綜高中,(04)25562012,http://www.hzsh.tc.edu.tw/,421\n西苑高中,(04)27016473,http://www.sysh.tc.edu.tw/,407\n沙鹿高工,(04)26621795,http://www.slvs.tc.edu.tw,433\n宜寧高中,(04)24621800,http://www.inhs.tc.edu.tw/,407\n忠明高中,(04)23224690,http://www.cmsh.tc.edu.tw/,403\n明台高中,(04)23393071,http://www.mths.tc.edu.tw/,413\n明道高中,(04)23372101,http://www.mingdao.edu.tw/homeX/Web/,414\n明德中學,(04)22877676,http://www.mdhs.tc.edu.tw/,402\n東大附中,(04)23590269,http://www.hn.thu.edu.tw/,407\n東山高中,(04)24360166,http://www.tsjh.tc.edu.tw/ischool/publish_page/0/,406\n東勢高工,(04)25872136,http://www.tsvs.tc.edu.tw,423\n長億高中,(04)22704022,http://www.cyhs.tcc.edu.tw/,411\n青年高中,(04)24954181,http://www.youth.tc.edu.tw/,412\n致用高中,(04)26872354,http://www.cycivs.tc.edu.tw,437\n國立興大附中,(04)24875199,http://www.dali.tc.edu.tw/,412\n常春藤高中,(04)25395066,http://net1.ivyjhs.tcc.edu.tw/indexpad6.php,427\n清水高中,(04)26222116,http://www.cshs.tc.edu.tw/,436\n惠文高中,(04)22503928,http://www.hwsh.tc.edu.tw/,408\n華盛頓高中,(04)23934712,http://www.whs.tc.edu.tw/,411\n慈明高中,(04)22713911,http://www.tmvs.tcc.edu.tw/,411\n新民高中,(04)22334105,http://www.shinmin.tc.edu.tw/,404\n新社高中,(04)25812116,http://www.sshs.tc.edu.tw,426\n葳格高中,(04)24371728,http://senior.wagor.tc.edu.tw/,406\n僑泰高中,(04)24063936,http://www.ctas.tc.edu.tw/,412\n嘉陽高中,(04)26152166;(04)26152168,http://www.cysh.tcc.edu.tw/,436\n臺中一中,(04)22226081,http://www.tcfsh.tc.edu.tw/,404\n臺中二中,(04)22021521,http://www.tcssh.tc.edu.tw/,404\n臺中女中,(04)22205108,http://www.tcgs.tc.edu.tw/,403\n臺中市立文華高中,(04)23124000,http://www.whsh.tc.edu.tw/,407\n臺中家商,(04)22223307,http://www.tchcvs.tc.edu.tw,401\n臺中特殊教育學校,(04)22582289,http://140.128.237.3,408\n臺中高工,(04)22613158,http://www.tcivs.tc.edu.tw,402\n臺中啟明學校,(04)25562126,http://www.cmsb.tc.edu.tw/ischool/publish_page/0/,421\n臺中啟聰學校,(04)23589577,http://www.thdf.tc.edu.tw/#,407\n衛道高中,(04)22911187,http://www.vtsh.tc.edu.tw/,406\n曉明女中,(04)22921175,http://www.smgsh.tc.edu.tw/,404\n興大附農,(04)22810010,http://www.tcavs.tc.edu.tw,401\n嶺東高中,(04)23898940,http://www.lths.tc.edu.tw/,408\n豐原高中,(04)25290381,http://www.fysh.tc.edu.tw/,420\n豐原高商,(04)25283556,http://www.fyvs.tc.edu.tw,420\n霧峰農工,(04)23303118,http://www.wufai.edu.tw/index.html,413\n十信高中,(02)28921166,http://www.shvs.tp.edu.tw/,112\n士林高商,(02)28313114,http://www.slhs.tp.edu.tw,111\n大安高工,(02)27091630,http://www.taivs.tp.edu.tw,106\n大直高中,(02)25334017,http://www.dcsh.tp.edu.tw/,104\n大理高中,(02)23026959,http://www.tlsh.tp.edu.tw/,108\n大誠高中,(02)22348989,http://www.tcsh.tp.edu.tw/,116\n中山女高,(02)25073148,http://web.csghs.tp.edu.tw/,104\n中正高中,(02)28234811,http://www.ccsh.tp.edu.tw/,112\n中崙高中,(02)27535316,http://www.zlsh.tp.edu.tw,105\n中興中學,(02)27412542,http://www.chsh.tp.edu.tw/,104\n內湖高工,(02)26574874,http://web.nihs.tp.edu.tw,114\n內湖高中,(02)27977035,http://www.nhsh.tp.edu.tw/,114\n文山特教學校,(02)86615183,http://www.wsses.tp.edu.tw,116\n文德女中,(02)27901753;(02)27904570,http://ms3.sfgsh.tp.edu.tw/,114\n方濟中學,(02)27910278,http://www.sfh.tp.edu.tw/,114\n木柵高工,(02)22300506,http://www.mcvs.tp.edu.tw,116\n北一女中,(02)23820484,http://www.fg.tp.edu.tw/,100\n市立大同高中,(02)25054269,http://www.ttsh.tp.edu.tw/,104\n永春高中,(02)27272983,http://www.ycsh.tp.edu.tw/,110\n立人高中,(02)23113423,http://www.lrsh.tp.edu.tw/,108\n再興中學,(02)29366803,http://www.thsh.tp.edu.tw/,116\n成功中學,(02)23216256,http://www.cksh.tp.edu.tw/,100\n成淵高中,(02)25531969,http://www.cyhs.tp.edu.tw/,103\n百齡高中,(02)28831568,http://www.blsh.tp.edu.tw/,111\n西松高中,(02)25286618,http://www.hssh.tp.edu.tw,105\n私立大同高中,(02)25925252,http://www.ttsh.tp.edu.tw/,104\n育成高中,(02)26530475,http://www.yucsh.tp.edu.tw/,115\n育達家商,(02)25706767,http://www.yudah.tp.edu.tw,105\n協和祐德高中,(02)27265775,http://www.hhvs.tp.edu.tw,110\n和平高中,(02)27324300,http://www.hpsh.tp.edu.tw/,106\n延平中學,(02)27071478,http://www.yphs.tp.edu.tw/,106\n明倫高中,(02)25961567,http://www.mlsh.tp.edu.tw/,103\n東山高中,(02)29395826,http://www.tshs.tp.edu.tw/,116\n東方工商,(02)27554616,http://www.tfvs.tp.edu.tw/tfvs/main.php,106\n松山工農,(02)27226616,http://192.192.135.24/,110\n松山家商,(02)27261118,http://www.ssvs.tp.edu.tw,110\n松山高中,(02)27535968,http://www.sssh.tp.edu.tw,110\n金甌女中,(02)23214765,http://www.cogsh.tp.edu.tw/,106\n南港高工,(02)27825432,http://www.nkhs.tp.edu.tw,115\n南港高中,(02)27837863,http://www.nksh.tp.edu.tw/,115\n南湖高中,(02)26308889,http://www.nhush.tp.edu.tw,114\n建國中學,(02)23034381,http://www.ck.tp.edu.tw/,100\n政大附中,(02)82377500,http://www.ahs.nccu.edu.tw/,116\n師大附中,(02)27075215,http://www.hs.ntnu.edu.tw/,106\n泰北高中,(02)28825560,http://web01.tpsh.tp.edu.tw/bin/home.php,111\n強恕高中,(02)23656570,http://www.qshs.tp.edu.tw/,100\n惇敘工商,(02)28912630,http://www.thvs.tp.edu.tw,112\n啟明學校(臺北市),(02)28740670,http://www.tmsb.tp.edu.tw/tmsb/,111\n啟智學校(臺北市),(02)28749117,http://www.tpmr.tp.edu.tw,111\n啟聰學校(臺北市),(02)25924446,http://www.tmd.tp.edu.tw/,103\n喬治工商,(02)27386515,http://www.gvs.tp.edu.tw,106\n復興高中,(02)28914131,http://www.fhsh.tp.edu.tw/,112\n復興實驗高中,(02)27715859,http://www.fhjh.tp.edu.tw/index.htm,106\n景文高中,(02)29390310,http://www.jwsh.tp.edu.tw/,116\n景美女中,(02)29368847,http://web.cmgsh.tp.edu.tw,116\n華江高中,(02)23019946,http://www.hcsh.tp.edu.tw/,108\n華岡藝校,(02)28612354,http://www.hka.edu.tw,111\n華興中學,(02)28316834,http://www.hhhs.tp.edu.tw/,111\n開平餐飲,(02)27556939,http://www.kpvs.tp.edu.tw,106\n開南商工,(02)23212666,http://www.knvs.tp.edu.tw,100\n陽明高中,(02)28316675,http://www.ymsh.tp.edu.tw/,111\n萬芳高中,(02)22309585,http://www.wfsh.tp.edu.tw/,116\n達人女中,(02)27956899,http://www.trgsh.tp.edu.tw/,114\n滬江中學,(02)86631122,http://www.hchs.tp.edu.tw/,116\n稻江高商,(02)25912001,http://www.tkcvs.tp.edu.tw,103\n稻江護家,(02)25955161,http://www.tcnvs.tp.edu.tw,104\n衛理女中,(02)28411487,http://www.wlgsh.tp.edu.tw/wesley/index.php,111\n靜修女中,(02)25574345,http://www.bish.tp.edu.tw/,103\n薇閣高中,(02)28913630,http://www.wghs.tp.edu.tw/,112\n麗山高中,(02)26570435,http://www.lssh.tp.edu.tw/,114\n公東高工,(089)222877,http://www.ktus.ttct.edu.tw,950\n台東女中,(089)321268,http://www.tgsh.ttct.edu.tw/,950\n成功商水,(089)850011,http://www.ckvs.ttct.edu.tw,961\n育仁中學,(089)382839,http://www.lotus.ttct.edu.tw/index2.php,950\n東大附特,(089)229912,http://www.nttusps.nttu.edu.tw/,950\n臺東高中,(089)322070,http://www.pttsh.ttct.edu.tw/,950\n臺東高商,(089)350575,http://www.tscvs.ttct.edu.tw,950\n臺東縣均一高中,(089)223301,http://junyi.tw/,950\n臺東體中,(089)383629,http://www.ntpehs.ttct.edu.tw/,950\n關山工商,(089)811006,http://www.ksvs.ttct.edu.tw/ezindex1.php,956\n蘭嶼高中,(089)732016,http://www.layjh.ttct.edu.tw/,952\n土城高中,(06)2577014,http://www.tcjh.tn.edu.tw/,709\n大灣高中,(06)2714223,http://www.dwhs.tn.edu.tw/,710\n六信高中,(06)2619885,http://www.lhvs.tn.edu.tw/,702\n北門高中,(06)7222150,http://www.pmsh.tnc.edu.tw/,722\n北門農工,(06)7260148,http://www.pmai.tnc.edu.tw,722\n永仁高中,(06)3115538,http://www.yrhs.tn.edu.tw,710\n玉井工商,(06)5741101,http://www.ycvs.tn.edu.tw,714\n白河商工,(06)6852054,http://www.phvs.tn.edu.tw,732\n光華高中,(06)2386501,http://www.khgs.tn.edu.tw/,701\n育德工家,(06)6563275,http://www.ytvs.tnc.edu.tw/,730\n亞洲餐旅,(06)2640175,http://www.asvs.tn.edu.tw,702\n明達高中,(06)6521178,http://www.mdsh.tnc.edu.tw/,737\n長榮女中,(06)2740381,http://www.ckgsh.tn.edu.tw/,701\n長榮高中,(06)2381711,http://www.cjshs.tn.edu.tw/index2.aspx,701\n南大附中,(06)2338501,http://210.59.18.242/main.php,710\n南大附聰,(06)5900504,http://www.tndsh.tn.edu.tw/,712\n南光高中,(06)6335408,http://www.nkhs.tnc.edu.tw/,730\n南科實驗高中,(06)5052916;(06)5052926,http://163.26.206.131/web/index.php,744\n南英商工,(06)2132222,http://www.nyvs.tn.edu.tw,700\n南寧中學,(06)2622458,http://www.nnjh.tn.edu.tw/,702\n後壁高中,(06)6871031,http://www.hpsh.tnc.edu.tw/,731\n家齊高中,(06)2133265,http://www.ccgsh.tn.edu.tw/,700\n崑山高中,(06)2364408,http://www.kssh.tn.edu.tw/,704\n曾文家商,(06)5722079,http://www.twvs.tnc.edu.tw,721\n曾文農工,(06)5721137,http://www.twivs.tnc.edu.tw,721\n港明高中,(06)7952025,http://www.kmsh.tnc.edu.tw/,723\n善化高中,(06)5837312,http://www.shsh.tnc.edu.tw/,741\n陽明工商,(06)6901190,http://www.ymvs.tnc.edu.tw,720\n慈幼工商,(06)2362106,http://www.ssvs.tn.edu.tw,701\n慈濟高中,(06)2932323,http://www.tcsh.tn.edu.tw/,708\n新化高工,(06)5903994,http://www.hhvs.tn.edu.tw,712\n新化高中,(06)5982065,http://www.hhsh.tn.edu.tw/,712\n新榮高中,(06)6222222,http://www.srsh.tnc.edu.tw/,736\n新營高工,(06)6322377,http://www.hyivs.tnc.edu.tw,730\n新營高中,(06)6562275,http://w3.hysh.tn.edu.tw/www/home.php,730\n新豐高中,(06)2304082,http://www.sfsh.tn.edu.tw/,711\n聖功女中,(06)2740126,http://www.skgsh.tn.edu.tw/,704\n臺南一中,(06)2371206,http://www.tnfsh.tn.edu.tw/,701\n臺南二中,(06)2514526,http://www.tnssh.tn.edu.tw/,704\n臺南女中,(06)2131928,http://www.tngs.tn.edu.tw/,700\n臺南海事,(06)3910772,http://www.tnvs.tn.edu.tw,708\n臺南高工,(06)2322131,http://www.ptivs.tnc.edu.tw/front/bin/home.phtml,710\n臺南高商,(06)2919226,http://www.tncvs.tn.edu.tw,702\n臺南啟智學校,(06)3554591,http://www.tnmr.tn.edu.tw/,709\n鳳和高級中學,(06)6223208,http://www.fhsh.tn.edu.tw/,736\n德光中學,(06)2894560,http://www.tkgsh.tn.edu.tw/,701\n黎明高中,(06)5717123,http://www.lmsh.tnc.edu.tw/,721\n興國高中,(06)6352201,http://www.hkhs.tnc.edu.tw/,730\n瀛海高中,(06)2568582,http://www.yhsh.tn.edu.tw/,709\n中道高中,(03)9306696,http://www.cdsh.ilc.edu.tw/,263\n宜蘭特殊教育學校,(03)9509788,http://www.isse.ilc.edu.tw,268\n宜蘭高中,(03)9324154,http://www.ylsh.ilc.edu.tw/,260\n宜蘭高商,(03)9384147,http://school.ilvs.ilc.edu.tw/front/bin/home.phtml,260\n南澳高中,(03)9981024,http://blog.ilc.edu.tw/blog/blog/4907,272\n慈心華德福,(03)9596222,http://,269\n慧燈高中,(03)9229968,http://www.hdsh.ilc.edu.tw/,264\n頭城家商,(039)9771131,http://www.tcvs.ilc.edu.tw,261\n羅東高工,(03)9514196,http://web.ltivs.ilc.edu.tw/bin/home.php,269\n羅東高中,(03)9567645,http://120.101.70.22/bin/home.php,265\n羅東高商,(03)9512875,http://www.ltcvs.ilc.edu.tw,265\n蘇澳海事,(03)9951661,http://www.savs.ilc.edu.tw,270\n蘭陽女中,(03)9333821,http://www.lygsh.ilc.edu.tw/,260\n上騰工商,(03)8538565,http://www.chvs.hlc.edu.tw,97367\n四維高中,(03)8561369,http://www.swsh.hlc.edu.tw/,970\n玉里高中,(03)8886171,http://www.ylsh.hlc.edu.tw/,981\n光復商工,(03)8700245,http://www.kfcivs.hlc.edu.tw,976\n花蓮女中,(03)8321202,http://www.hlgs.hlc.edu.tw/,970\n花蓮特教學校,(03)8544225,http://www.hlmrs.hlc.edu.tw/default.asp,973\n花蓮高工,(03)8226108,http://www.hlis.hlc.edu.tw,970\n花蓮高中,(03)8242236,http://www.hlhs.hlc.edu.tw/,970\n花蓮高商,(03)8312246,http://www.hlbh.hlc.edu.tw,970\n花蓮高農,(03)8312301,http://www.hla.hlc.edu.tw,970\n花蓮體育高中,(03)8462610,http://www.hpehs.hlc.edu.tw/,970\n海星高中,(03)8223116,http://www.smhs.hlc.edu.tw/,971\n慈大附中,(03)8572823,http://203.68.24.4/,970\n金門高中,(082)326582,http://www.kmsh.km.edu.tw/,893\n金門農工,(082)33508,http://www.kmvs.km.edu.tw,891\n三育高中,(049)2897212,http://www.taa.ntct.edu.tw/,555\n中興高中,(049)2331014,http://www.chsh.ntct.edu.tw/,540\n五育高中,(049)2246346,http://www.wu-yu.ntct.edu.tw/,540\n仁愛高農,(049)2802619,http://www.ravs.ntct.edu.tw,546\n水里商工,(049)2870666,http://www.slvs.ntct.edu.tw,553\n弘明實驗高中,(049)2731799,http://www.holdmean.org.tw,551\n同德家商,(049)2553109,http://www.tdvs.ntct.edu.tw,542\n旭光高中,(049)2563472,http://www.skjhs.ntct.edu.tw/,542\n竹山高中,(049)2643344,http://www.cshs.ntct.edu.tw/,557\n南投特教,(049)2390773,http://www.ntss.ntct.edu.tw/,540\n南投高中,(049)2231175,http://163.22.35.7/,540\n南投高商,(049)2222269,http://www.pntcv.ntct.edu.tw,540\n埔里高工,(049)2982225,http://www.plvs.ntct.edu.tw,545\n草屯商工,(049)2362082,http://www.ttvs.ntct.edu.tw,542\n普台高中,(049)2932899,http://www.ptsh.ntct.edu.tw/,545\n暨大附中,(049)2913483,http://www.pshs.ntct.edu.tw/,545\n大同高中,(08)7663916,http://web.dtjh.ptc.edu.tw,900\n內埔農工,(08)7991103,http://www.npvs.ptc.edu.tw,912\n日新工商,(08)7882343,http://www.jhvs.ptc.edu.tw,920\n民生家商,(08)7239826,http://www.msvs.ptc.edu.tw,900\n來義高中,(08)7850086,http://www.lyhs.ptc.edu.tw,922\n枋寮高中,(08)8782095,http://www.fljh.ptc.edu.tw/,940\n東港海事,(08)8333131,http://www.tkms.ptc.edu.tw,928\n東港高中,(08)8322014,http://www.dkjh.ptc.edu.tw/main.asp,928\n屏北高中,(08)7937493,http://www.ppsh.ptc.edu.tw/,907\n屏東女中,(08)7362204,http://www.ptgsh.ptc.edu.tw/,900\n屏東特殊教育學校,(08)7805510,http://web.pses.ptc.edu.tw/default1.asp,920\n屏東高工,(08)7523781,http://www.ptivs.ptc.edu.tw,900\n屏東高中,(08)7667473,http://www.pths.ptc.edu.tw/,900\n屏榮高中,(08)7223409,http://www.prvs.ptc.edu.tw/,900\n恆春工商,(08)8892010,http://www.hcvs.ptc.edu.tw,946\n美和高中,(08)7792045,http://www.mhsh.ptc.edu.tw/,912\n國立佳冬高農,(08)8662726,http://www.ctvs.ptc.edu.tw,931\n陸興高中,(08)7225837,http://www.lssh.ptc.edu.tw/,900\n華洲工家,(08)7521516,http://www.hcivs.ptc.edu.tw,900\n潮州高中,(08)7882017,http://www.ccsh.ptc.edu.tw/ccsh2010/index.php,920\n三義高中,(037)872015,http://www.sjh.mlc.edu.tw/,367\n大同高中,(037)580566,http://www.dtjh.mlc.edu.tw/,350\n大成高中,(037)663371,http://www.tcsh.mlc.edu.tw/,351\n大湖農工,(037)992216,http://www.thvs.mlc.edu.tw,364\n中興商工,(037)467360,http://www.csvs.mlc.edu.tw/bin/home.php,350\n全人高中,(04)25896909,http://holistic.org.tw/,369\n竹南高中,(037)476855,http://www.cnsh.mlc.edu.tw/,350\n君毅高中,(037)622009,http://www.cish.mlc.edu.tw/,350\n育民工家,(037)353888,http://www.ymvs.mlc.edu.tw,360\n卓蘭高中,(04)25892007,http://www.cles.mlc.edu.tw/,369\n建台高中,(037)353270,http://www.ctsh.mlc.edu.tw/,360\n苗栗特殊教育學校,(037)266498,http://www.mlses.mlc.edu.tw/,360\n苗栗高中,(037)320072,http://www.mlsh.mlc.edu.tw/,360\n苗栗高商,(037)356001,http://www.mlvs.mlc.edu.tw,360\n苗栗農工,(037)329281,http://www.mlaivs.mlc.edu.tw,360\n苑裡高中,(037)861042,http://www.yljh.mlc.edu.tw/,358\n國立苑裡高中,(037)868680,http://www.ylsh.mlc.edu.tw/,358\n賢德工商,(037)751011,http://www.sdvs.mlc.edu.tw/,357\n興華高中,(037)663403,http://www.shhs.mlc.edu.tw/,351\n龍德家商,(037)851277,http://www.ldvs.mlc.edu.tw,358\n大華高中,(03)4825507,http://www.thsh.tyc.edu.tw/,326\n大園國際高中,(03)3813001,http://www.dysh.tyc.edu.tw/,337\n大溪高中,(03)3878628,http://www.dssh.tyc.edu.tw,335\n大興高中,(03)3862330,http://www.tsvs.tyc.edu.tw/,337\n中大壢中,(03)4932181,http://www.clhs.tyc.edu.tw/,320\n中壢家商,(03)4271627,http://www.clvs.tyc.edu.tw/,320\n中壢高商,(03)4929871,http://www.clvsc.tyc.edu.tw/bin/home.php,320\n內壢高中,(03)4528080,http://www.nlhs.tyc.edu.tw/,320\n六和高中,(03)4204000,http://www.lhvs.tyc.edu.tw/,324\n方曙商工,(03)4796345,http://www.fsvs.tyc.edu.tw,325\n平鎮高中,(03)4287288,http://www.pjhs.tyc.edu.tw/,324\n永平工商,(03)4822464,http://www.ypvs.tyc.edu.tw,326\n永豐高中,(03)3692679,http://www.yfms.tyc.edu.tw/,334\n光啟高中,(02)82098313,http://www.phsh.tyc.edu.tw/,333\n成功工商,(03)3294188,http://www.ckvs.tyc.edu.tw,333\n至善高中,(03)3887528,http://www.lovejs.tw/,335\n育達高中,(03)4934101,http://www.yuda.tyc.edu.tw/,324\n武陵高中,(03)3698170,http://www.wlsh.tyc.edu.tw/,330\n治平高中,(03)4823636,http://www.cpshs.tyc.edu.tw/,326\n南崁高中,(03)3525580,http://www.nksh.tyc.edu.tw,338\n振聲高中,(03)3322605,http://www.fxsh.tyc.edu.tw/,330\n桃園高中,(03)3946013,http://www.tysh.tyc.edu.tw/,330\n桃園啟智學校,(03)3647099,http://203.71.245.1,330\n國立北科附工,(03)3333921,http://www.tyai.tyc.edu.tw,330\n啟英高中,(03)4523036,http://www.cyvs.tyc.edu.tw/,320\n清華高中,(03)4771196,http://www.chvs.tyc.edu.tw/,327\n復旦高級中等學校,(03)4932476,http://www.fths.tyc.edu.tw/,324\n陽明高中,(03)3645761,http://www.pymhs.tyc.edu.tw/,330\n新興高中,(03)3796996,http://www.hshs.tyc.edu.tw/,334\n楊梅高中,(03)4789618,http://www.ymhs.tyc.edu.tw/,326\n壽山高中,(03)3501778,http://www.sssh.tyc.edu.tw,333\n漢英高級中學,(03)4711388,http://www.cchs.tyc.edu.tw/cchs/main.php,325\n龍潭高中,(03)4792829,http://www.ltsh.tyc.edu.tw/bin/home.php,325\n觀音高中,(03)4981464,http://www.gish.tyc.edu.tw/gish/htdocs/,328\n三民家商,(07)5525887,http://www.smvhs.kh.edu.tw,813\n三民高中,(07)3475181,http://www.smhs.kh.edu.tw/,807\n三信家商,(07)7517171,http://163.32.84.1/sansin2017/index.html,802\n大榮高中,(07)5613281,http://www.dystcs.kh.edu.tw/,804\n小港高中,(07)8062627,http://www.hkhs.kh.edu.tw/,812\n中山大學附中,(07)3603600,http://www.kksh.kh.edu.tw/,811\n中山工商,(07)7815311,http://www.csic.khc.edu.tw,831\n中山高中,(07)3641116,http://www.cshs.kh.edu.tw/,811\n中正高工,(07)7232301,http://www.ccvs.kh.edu.tw,806\n中正高中,(07)7491992,http://www.cchs.kh.edu.tw/,802\n中正預校,(07)7414188,http://www.ccafps.khc.edu.tw,830\n中華藝校,(07)5549696,http://www.charts.kh.edu.tw/index1.htm,804\n仁武高中,(07)3721640,http://www.rwm.ks.edu.tw/,814\n六龜高中,(07)6891023,http://www.lgm.ks.edu.tw/,844\n天主教道明高級中學,(07)2240711,http://www.dmhs.kh.edu.tw/,802\n文山高中,(07)7777272,http://www.wsm.ks.edu.tw/,833\n左營高中,(07)5822010,http://www.tyhs.edu.tw/,813\n正義高中,(07)7225529,http://www.cysh.khc.edu.tw/,830\n立志中學,(07)3922601,http://163.32.74.149/199/index.php,807\n成功啟智學校,(07)3304624,http://www.ckmr.kh.edu.tw,806\n岡山高中,(07)6212033,http://www.kssh.khc.edu.tw/,820\n岡山農工,(07)6217129,http://www.ksvs.khc.edu.tw,820\n明誠高中,(07)5521593,http://www.mcsh.kh.edu.tw/,804\n林園高中,(07)6412059,http://www.ly.ks.edu.tw/,832\n前鎮高中,(07)8125147,http://www.cjhs.kh.edu.tw/,806\n海青工商,(07)5819155,http://www.hcvs.kh.edu.tw,813\n高英工商,(07)7832991,http://210.60.110.1,831\n高苑工商,(07)6111101,http://www.kyvs.ks.edu.tw,825\n高師大附中,(07)7613875,http://www.nknush.kh.edu.tw/,802\n高雄女中,(07)2115418,http://www.kghs.kh.edu.tw/,801\n高雄中學,(07)2862550,http://www.kshs.kh.edu.tw/,807\n高雄仁武特殊教育學校,(07)3749788,http://w3.ses.ks.edu.tw/front/bin/home.phtml,814\n高雄高工,(07)3815366,http://www.ksvs.kh.edu.tw,807\n高雄高商,(07)2269975,http://www.ksvcs.kh.edu.tw,800\n高雄啟智學校,(07)2235940,http://www.kmsmr.kh.edu.tw/,802\n高鳳工家,(07)8010534,http://www.kfvhs.kh.edu.tw,812\n高餐大附中,(07)8060705,http://nkhhs.nkuht.edu.tw/,812\n國際商工,(07)7228565,http://www.kcvs.kh.edu.tw,802\n復華高中,(07)3344168,http://www.fhhs.kh.edu.tw/,802\n普門高中,(07)6562676,http://www.pmsh.khc.edu.tw/,840\n華德工家,(07)6921212,http://www.htvs.ks.edu.tw,852\n新光高中,(07)7019888,http://www.lysh.khc.edu.tw/,831\n新莊高中,(07)3420103,http://www.hchs.kh.edu.tw/,813\n新興高中,(07)2727127,http://www.hhhs.kh.edu.tw/,800\n楠梓特殊學校,(07)3642007,http://www.nzsmr.kh.edu.tw,811\n楠梓高中,(07)3550571,http://www.nths.kh.edu.tw/,811\n瑞祥高中,(07)8152271,http://www.rssh.kh.edu.tw/,806\n義大國際高中,(07)6577115,http://www.isis.ks.edu.tw,840\n路竹高中,(07)6963008,http://www.lchs.ks.edu.tw/,821\n鼓山高中,(07)5213258,http://www.kusjh.kh.edu.tw/,804\n旗山農工,(07)6612501,http://www.csvs.khc.edu.tw,842\n旗美高中,(07)6612502,http://www.cmsh.khc.edu.tw/,842\n旗美商工,(07)6812152,http://www.cmvs.ks.edu.tw,843\n福誠高中,(07)8224646,http://www.ftm.ks.edu.tw/,830\n鳳山高中,(07)7463150,http://www.fssh.khc.edu.tw/,830\n鳳山商工,(07)7462602,http://www.fsvs.ks.edu.tw,830\n鳳新高中,(07)7658288,http://www.fhsh.khc.edu.tw/,830\n樹德家商,(07)3848622,http://www.shute.kh.edu.tw,807\n二信高中,(02)24623131,http://www.essh.kl.edu.tw/,202\n八斗高中,(02)24692366,http://www.bdjh.kl.edu.tw/,202\n中山高中,(02)24248191,http://www.csjh.kl.edu.tw/,203\n光隆家商,(02)24222237,http://www.klhcvs.kl.edu.tw/,201\n安樂高中,(02)24236600,http://www.aljh.kl.edu.tw/,204\n基隆女中,(02)24278274,http://www.klgsh.kl.edu.tw/,201\n基隆海事,(02)24633655,http://www.klvs.kl.edu.tw,202\n基隆特教學校,(02)24526332,http://,206\n基隆高中,(02)24570931,http://www.klsh.kl.edu.tw/,205\n基隆商工,(02)24567126,http://www.klcivs.kl.edu.tw,206\n基隆輔大聖心高中,(02)24282454,http://www.shsh.kl.edu.tw/,203\n培德工家,(02)24652121,http://www.ptvs.kl.edu.tw,201\n暖暖高中,(02)24575534,http://www.nnjh.kl.edu.tw/,205\n馬祖高中,(0836)25045,http://www.mssh.matsu.edu.tw/,209\n土庫商工,(05)6622538,http://www.tkvs.ylc.edu.tw,633\n大成商工,(05)6322534,http://www.tcvhs.ylc.edu.tw,632\n大德工商,(05)5973333,http://www.ddvs.ylc.edu.tw,630\n文生高中,(05)7872024,http://www.svsh.ylc.edu.tw/,654\n斗六高中,(05)5322039,http://www.tlsh.ylc.edu.tw/,640\n斗南高中,(05)5972059,http://www.tnjh.ylc.edu.tw/,630\n北港高中,(05)7821411,http://www.pksh.ylc.edu.tw/,651\n北港農工,(05)7832246,http://www.pkvs.ylc.edu.tw,651\n古坑華德福實驗高中,(05)6341003;(05)5828199,http://tw.school.uschoolnet.com/?id=es00003779,646\n巨人高中,(05)7835937,http://www.tssh.ylc.edu.tw/,651\n正心高中,(05)5512502,http://www.shsh.ylc.edu.tw/,640\n永年高中,(05)6622540,http://www.ynhs.ylc.edu.tw/,633\n西螺農工,(05)5862024,http://www.hlvs.ylc.edu.tw,648\n虎尾高中,(05)6337592,http://www.hwsh.ylc.edu.tw/,632\n虎尾農工,(05)6322767,http://www.hwaivs.ylc.edu.tw,632\n國立斗六家商,(05)5322147,http://www.tlhc.ylc.edu.tw,640\n麥寮高中,(05)6932050,http://www.mljh.ylc.edu.tw/,638\n揚子高中,(05)6330181,http://www.ytjh.ylc.edu.tw/,632\n雲林特殊教育學校,(05)5969241,http://www.nyses.ylc.edu.tw/,630\n義峰高中,(05)5800099,http://www.yfsh.ylc.edu.tw/,643\n福智高中,(05)5828222,http://bwsh.ylc.edu.tw,646\n維多利亞高中,(05)5378899,http://,640\n三民高中,(02)22894675,http://www.smsh.tpc.edu.tw/,247\n三重高中,(02)29760501,http://www.schS.Ntpc.edu.tw/,241\n三重商工,(02)29715606,http://www.scvs.ntpc.edu.tw/bin/home.php,241\n中和高中,(02)22227146,http://www.chshs.ntpc.edu.tw/,235\n中華高中,(02)22693641,http://www.chsh.ntpc.edu.tw/,236\n中華商海,(02)24922119,http://www.chmvs.tpc.edu.tw,207\n丹鳳高中,(02)29089627,http://www.dfsh.ntpc.edu.tw/,242\n及人高中,(02)22112581,http://www.cjsh.ntpc.edu.tw/,231\n北大高中,(02)26742666,http://www.bdsh.ntpc.edu.tw/default.asp,237\n永平高中,(02)22319670,http://163.20.152.6/,234\n石碇高中,(02)26631224,http://www.sdhs.tpc.edu.tw/,223\n光仁高中,(02)29615161,http://www.kjsh.ntpc.edu.tw/bin/home.php,220\n光復高中,(02)29582366,http://www.gfhs.ntpc.edu.tw/,220\n安康高中,(02)22111743,http://www.akhs.ntpc.edu.tw/,231\n竹林高中,(02)29425074,http://www.clsh.ntpc.edu.tw/,235\n竹圍高中,(02)28091557,http://www.zwhs.ntpc.edu.tw/default.asp,251\n秀峰高中,(02)26412134,http://www.sfhs.ntpc.edu.tw/,221\n明德高中,(02)26723302,http://www.mdhs.ntpc.edu.tw/,237\n東海高中,(02)29822788,http://www.thhs.ntpc.edu.tw/,241\n林口高中,(02)26009482,http://www.lksh.ntpc.edu.tw/,244\n板橋高中,(02)29602500,http://pcsh.ntpc.edu.tw/,220\n金山高中,(02)24982028,http://www.cshs.ntpc.edu.tw/,208\n金陵女中,(02)29956776,http://www.glghs.ntpc.edu.tw/,241\n南山高中,(02)22453000,http://www.nssh.ntpc.edu.tw/,235\n南強工商,(02)29155144,http://www.ncvs.ntpc.edu.tw,231\n恆毅中學,(02)29923619,http://www.hchs.ntpc.edu.tw/,242\n徐匯高中,(02)22817565,http://www.sish.ntpc.edu.tw/,247\n時雨高中,(02)24962217,http://www.syjh.ntpc.edu.tw/,224\n格致高中,(02)29883488,http://www.gjsh.ntpc.edu.tw/,241\n泰山高中,(02)22963625,http://www.tssh.ntpc.edu.tw/,243\n海山高中,(02)29517475,http://www.hshs.ntpc.edu.tw/,220\n能仁家商,(02)29182399,http://www.nrvs.ntpc.edu.tw,231\n崇光女中,(02)29112544,http://www.ckgsh.ntpc.edu.tw,231\n崇義高中,(02)86482078,http://www.tysh.ntpc.edu.tw/,221\n康橋高中,(02)22166000,http://www.kcbs.ntpc.edu.tw/,231\n淡水商工,(02)26203930,http://www.tsvs.ntpc.edu.tw,251\n淡江高中,(02)26203850,http://www.tksh.ntpc.edu.tw/,251\n清水高中,(02)22707801,http://www.cssh.ntpc.edu.tw/,236\n清傳高商,(02)29955535,http://www.ccvs.ntpc.edu.tw,241\n莊敬高職,(02)22188956,http://www.jjvs.ntpc.edu.tw,231\n復興商工,(02)29262121,http://www.fhvs.ntpc.edu.tw,234\n智光商工,(02)29432491,http://www.ckvs.ntpc.edu.tw,234\n華僑高中,(02)29684131,http://www.nocsh.ntpc.edu.tw,220\n開明工商,(02)29136061,http://www.kmvs.tpc.edu.tw,231\n新北特教,(02)26006768,http://www.lkm.ntpc.edu.tw/,244\n新北高工,(02)22612483,http://www.ntvs.ntpc.edu.tw/bin/home.php,236\n新北高中,(02)28577326,http://www.ntsh.ntpc.edu.tw/,241\n新店高中,(02)22193700,http://www.htsh.ntpc.edu.tw/,231\n新莊高中,(02)29912391,http://www.hcsh.ntpc.edu.tw/,242\n瑞芳高工,(02)24972516,http://www.jfvs.ntpc.edu.tw,224\n聖心女中,(02)26184005,http://www.shgsh.ntpc.edu.tw/,249\n裕德中學,(02)82617889,http://www.yuteh.ntpc.edu.tw/,236\n穀保家商,(02)29712343,http://www.kpvs.ntpc.edu.tw,241\n樹人家商,(02)26870391,http://www.stgvs.ntpc.edu.tw,238\n樹林高中,(02)86852011,http://www.slsh.ntpc.edu.tw/,238\n豫章工商,(02)29519810,http://www.ycvs.ntpc.edu.tw,220\n醒吾高中,(02)26012644,http://www.swsh.ntpc.edu.tw/bin/home.php,244\n錦和高中,(02)22498566,http://www.jhjh.ntpc.edu.tw/,235\n雙溪高中,(02)24931028,http://www.sxhs.ntpc.edu.tw/,227\n辭修高中,(02)86761277,http://www.tsshs.ntpc.edu.tw/,237\n鶯歌工商,(02)26775040,http://www.ykvs.ntpc.edu.tw,239\n世界高中,(03)5783271,http://www.wvs.hc.edu.tw/,300\n光復高中,(03)5753534,http://www.kfsh.hc.edu.tw/,300\n成德高中,(03)5258748,http://www.cdjh.hc.edu.tw/,3008\n建功高中,(03)5745892,http://www.ckjh.hc.edu.tw/,300\n科學工業園區實驗高中,(03)5777011,http://www.nehs.hc.edu.tw/,300\n香山高中,(03)5384332,http://www.hhjh.hc.edu.tw/,3009\n新竹女中,(03)5456611,http://www.hgsh.hc.edu.tw/,300\n新竹高工,(03)5322175,http://www.hcvs.hc.edu.tw,300\n新竹高中,(03)5736666,http://www.hchs.hc.edu.tw/bin/home.php,300\n新竹高商,(03)5722150,http://www.hccvs.hc.edu.tw,300\n磐石高中,(03)5223946,http://www.sphs.hc.edu.tw/,3008\n曙光女中,(03)5325709,http://www.sggs.hc.edu.tw/,300\n內思高工,(03)5882520,http://163.19.9.241/ischool/publish_page/0/,305\n六家高中,(03)5503824,http://www.ljjh.hcc.edu.tw/bin/home.php,302\n仰德高中,(03)5592158,http://www.ydvs.hcc.edu.tw/,304\n竹北高中,(03)5517330,http://www.cpshs.hcc.edu.tw/,302\n竹東高中,(03)5962024,http://www.ctsh.hcc.edu.tw/,310\n忠信高中,(03)5595775,http://www.chhs.hcc.edu.tw/,304\n東泰高中,(03)5961232,http://www.ttsh.hcc.edu.tw/,310\n湖口高中,(03)5690772,http://www.hkhs.hcc.edu.tw/,303\n新竹特殊教育學校,(03)6676639,http://www.nhs.hcc.edu.tw/,302\n義民高中,(03)5552020,http://www.ymsh.hcc.edu.tw/,302\n關西高中,(03)5872049,http://www.khvs.hcc.edu.tw/,306\n仁義高中,(05)2765555,http://www.zysh.cy.edu.tw/,600\n立仁高中,(05)2226420,http://www.ligvs.cy.edu.tw,600\n宏仁女中,(05)2322802,http://www.hjgs.cy.edu.tw/,600\n東吳工家,(05)2246161,http://www.dwvs.cy.edu.tw,600\n國立嘉義高商,(05)2782421,http://www.cyvs.cy.edu.tw,600\n華南高商,(05)2787140,http://www.hnvs.cy.edu.tw,600\n嘉華高中,(05)2761716,http://www.chsh.cy.edu.tw/,600\n嘉義女中,(05)2254603,http://www.cygsh.cy.edu.tw/,601\n嘉義家職,(05)2259640,http://www.cyhvs.cy.edu.tw,600\n嘉義特教學校,(05)2858549,http://www.cymrs.cy.edu.tw,600\n嘉義高工,(05)2763060,http://www.cyivs.cy.edu.tw,600\n嘉義高中,(05)2762804,http://www.cysh.cy.edu.tw/,600\n輔仁高中,(05)2281001,http://www.fjsh.cy.edu.tw/,600\n興華高中,(05)2764318,http://www.hhsh.cy.edu.tw/,600\n弘德工商,(05)369-1473,http://www.cdvs.cyc.edu.tw,613\n民雄農工,(05)2267120,http://www.mhvs.cyc.edu.tw,621\n永慶高中,(05)3627226,http://www.ycsh.cyc.edu.tw/,612\n同濟高中,(05)2652248,http://www.tjsh.cyc.edu.tw/,622\n竹崎高中,(05)2611006,http://www.ccjh.cyc.edu.tw,604\n協同高中,(05)2213045,http://www.cmsh.cyc.edu.tw/,621\n協志工商,(05)2264264,http://www.ccivs.cyc.edu.tw/,621\n東石高中,(05)3794180,http://www.tssh.cyc.edu.tw/,613\n新港藝術高中,(05)3747060,http://,616\n萬能工商,(05)2687777,http://www.wnvs.cyc.edu.tw,608\n二林高中,(04)8960121,http://www.elsh.chc.edu.tw/,526\n大慶商工,(04)8311005,http://www.dcvs.chc.edu.tw,510\n文興高中,(04)8753889,http://web1.hshs.chc.edu.tw/bin/home.php,520\n北斗家商,(04)8882224,http://www.pthc.chc.edu.tw,521\n正德高中,(04)7524109,http://www.zdvs.chc.edu.tw/,500\n永靖高工,(04)8221810,http://www.yjvs.chc.edu.tw,512\n田中高中,(04)8745820,http://163.23.85.193/ischool/publish_page/0/,520\n成功高中,(04)8828588,http://www.ckjh.chc.edu.tw/bin/home.php,514\n和美高中,(04)7552043,http://www.hmjh.chc.edu.tw,508\n和美實驗學校,(04)7552009,http:// www.nhes.edu.tw,508\n員林家商,(04)8320260,http://163.23.169.3/,510\n員林高中,(04)8320364,http://www.ylsh.chc.edu.tw/,510\n員林農工,(04)8360105,http://www.ylvs.chc.edu.tw,510\n國立二林工商,(04)8962132,http://www.elvs.chc.edu.tw,526\n國立秀水高工,(04)7697021,http://,504\n崇實高工,(04)8347106,http://www.csvs.chc.edu.tw,510\n鹿港高中,(04)7772403,http://www.lksh.chc.edu.tw/,505\n溪湖高中,(04)8826436,http://www.hhsh.chc.edu.tw/,514\n達德商工,(04)8753929,http://www.tdvs.chc.edu.tw,520\n彰化女中,(04)7240042,http://www.chgsh.chc.edu.tw/,500\n彰化特殊教育學校,(04)8727303,http://www.chsmr.chc.edu.tw/,511\n彰化高中,(04)7222121,http://www.chsh.chc.edu.tw/,500\n彰化高商,(04)7262963;(04)7262623,http://w2.chsc.tw,500\n彰化藝術高中,(04)7222844;(04)72222844,http://163.23.68.78,500\n彰師大附工,(04)7252541,http://www.sivs.chc.edu.tw/bin/home.php,500\n精誠高中,(04)7622790,http://www.cchs.chc.edu.tw/,500\n馬公高中,(06)9270522,http://www.mksh.phc.edu.tw/,880\n澎湖海事,(06)9261101,http://www.phmhs.phc.edu.tw,880";

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
    use_local_file: true,
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