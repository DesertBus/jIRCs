// http://data.iana.org/TLD/tlds-alpha-by-domain.txt
// Version 2012062900, Last Updated Sun Jul  1 07:07:01 2012 UTC
jIRCs.prototype.tlds = ["AC","AD","AE","AERO","AF","AG","AI","AL","AM","AN","AO","AQ","AR","ARPA","AS","ASIA","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BIZ","BJ","BM","BN","BO","BR","BS","BT","BV","BW","BY","BZ","CA","CAT","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","COM","COOP","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EDU","EE","EG","ER","ES","ET","EU","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GOV","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","INFO","INT","IO","IQ","IR","IS","IT","JE","JM","JO","JOBS","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MG","MH","MIL","MK","ML","MM","MN","MO","MOBI","MP","MQ","MR","MS","MT","MU","MUSEUM","MV","MW","MX","MY","MZ","NA","NAME","NC","NE","NET","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","ORG","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PRO","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","ST","SU","SV","SX","SY","SZ","TC","TD","TEL","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TP","TR","TRAVEL","TT","TV","TW","TZ","UA","UG","UK","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","XN--0ZWM56D","XN--11B5BS3A9AJ6G","XN--3E0B707E","XN--45BRJ9C","XN--80AKHBYKNJ4F","XN--80AO21A","XN--90A3AC","XN--9T4B11YI5A","XN--CLCHC0EA0B2G2A9GCD","XN--DEBA0AD","XN--FIQS8S","XN--FIQZ9S","XN--FPCRJ9C3D","XN--FZC2C9E2C","XN--G6W251D","XN--GECRJ9C","XN--H2BRJ9C","XN--HGBK6AJ7F53BBA","XN--HLCJ6AYA9ESC7A","XN--J6W193G","XN--JXALPDLP","XN--KGBECHTV","XN--KPRW13D","XN--KPRY57D","XN--LGBBAT1AD8J","XN--MGBAAM7A8H","XN--MGBAYH7GPA","XN--MGBBH1A71E","XN--MGBC0A9AZCG","XN--MGBERP4A5D4AR","XN--O3CW4H","XN--OGBPF8FL","XN--P1AI","XN--PGBS0DH","XN--S9BRJ9C","XN--WGBH1C","XN--WGBL6A","XN--XKC2AL3HYE2A","XN--XKC2DL3A5EE0H","XN--YFRO4I67O","XN--YGBI2AMMX","XN--ZCKZAH","XXX","YE","YT","ZA","ZM","ZW"].sort(function(a,b) {if (a.length > b.length) return -1; if (a.length < b.length) return 1; return 0;});

jIRCs.prototype.url_regex = new RegExp('(\\b)(?:(https?|ftp|svn|git)://)?((?:[a-z0-9](?:[a-z0-9\\-]*[a-z0-9])?\\.)+(?:'+jIRCs.prototype.tlds.join('|')+'))(/[^\\s]*[^\\s`!()\\[\\]{};:\'".,<>?«»“”‘’])?(\\b)','ig');

jIRCs.prototype.linkMunger = function(match, b1, protocol, domain, path, b2, offset, string) {
    var url = match;
    if(!protocol) {
        url = 'http://' + url;
    }
    return b1 + '<a href="' + url + '" target="_blank">' + match + '</a>' + b2;
};

jIRCs.prototype.handleLine = function(message, disobj) {
    if(message.charAt(0) == '/') {
        var args = message.substr(1).split(' ');
        var command = args.shift().toUpperCase();
        var method = 'command_' + command;
        if(method in this) {
            this[method](args, disobj);
        } else {
            this.send(command, args);
        }
    } else {
        this.say(message, disobj.window);
    }
};

jIRCs.prototype.parseMessage = function(s) {
    var method = '',
        p = '',
        command = '',
        args = [],
        trailing = '';
    s = s.trim();
    if(s == '') {
        return;
    }
    if(s.charAt(0) == ':') {
        args = s.split(' ');
        p = args.shift().substr(1).split('!',1)[0];
        s = args.join(' ');
    }
    if(s.indexOf(' :') != -1) {
        var msg = s.split(' :');
        args = msg.shift().split(' ');
        trailing = ':'+msg.join(' :');
        args.push(trailing);
    } else {
        args = s.split(' ');
    }
    command = args.shift();
    method = 'irc_' + command.toUpperCase();
    console.log("<<< " + method + "('" + p + "'," + JSON.stringify(args) + ")");
    if(method in this) {
        this[method](p, args);
    }
};

jIRCs.prototype.getNick = function(prefix) { return prefix.split('!')[0]; };

jIRCs.prototype.zip = function(keys, values) {
    var r = {};
    for(var i = 0, k, v; (k = keys[i]) && (v = values[i]); i++) {
        r[k] = v;
    }
    return r;
};

jIRCs.prototype.forEach = function(object, fn, scope) {
    if(!object) {
        // Do nothing if undefined
    } else if(object.forEach) {
        object.forEach(fn, scope);
    } else if(object.length) {
        for(var i = 0, len = object.length; i < len; ++i) {
            fn.call(scope || object, object[i], i, object);
        }
    } else {
        for(var k in object) {
            if(object.hasOwnProperty(k)) {
                fn.call(scope || object, object[k], k, object);
            }
        }
    }
};
