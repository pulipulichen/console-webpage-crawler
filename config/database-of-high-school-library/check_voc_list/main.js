main = function () {
    // 這時候會有 VOC_LIST SCHOOL_LIST
    // 要確認每一個VOC_LIST都有符合到 SCHOOL_LIST
    
    for (var _i = 0; _i < VOC_LIST.length; _i++) {
        var _v = VOC_LIST[_i];
        if (typeof(_v) === "string") {
            _v  = [_v];
        }
        
        var _found = false;
        for (var _j = 0; _j < _v.length; _j++) {
            var _name = _v[_j];
            for (var _k = 0; _k < SCHOOL_LIST.length; _k++) {
                var _school = SCHOOL_LIST[_k];
                for (var _l = 0; _l < _school.length; _l++) {
                    if (_school[_l] === _name) {
                        _found = true;
                        break;
                    }
                }
                if (_found === true) {
                    break;
                }  
            }
            if (_found === true) {
                break;
            }
        }
        
        if (_found === false) {
            console.log(["!!!!沒找到", _v.join("&")]);
        }
        else {
            //console.log(["有找到", _v.join("&")]);
        }
    }
};


        main();