/*
Copyright (c) 2012, Christopher Gamble
All rights reserved.
 
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
   * Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in the
     documentation and/or other materials provided with the distribution.
   * Neither the name of the Christopher Gamble nor the names of its 
     contributors may be used to endorse or promote products derived 
     from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/* Public interface */
function jIRCs(conn_generator) {
    this.buf = '';
    this.queue = [];
    this.displays = [];
    this.channels = {};
    this.chantypes = [];
    this.statuses = {};
    this.statusOrder = [];
    this.statusSymbols = {};
    this.chanModes = {};
    this.userModes = [];
    this.scrollbackSize = 500;
    this.reconnect_delay = 0;
    this.nickname = '';
    this.password = '';
    this.registered = false;
    this.connected = false;
    this.account = false;
    this.conn_generator = conn_generator;
    this.conn = conn_generator();
    this.conn.parent = this;
    this.conn.onopen = function(e) { this.parent.onconnect(e); };
    this.conn.onmessage = function(e) { this.parent.onmessage(e); };
    this.conn.onclose = function(e) { this.parent.ondisconnect(e); };
};

jIRCs.prototype.version = 'jIRCs 0.1';

jIRCs.prototype.nick = function(nick,pass) {
    nick = nick.replace(" ","_");
    while(!this.nick_regex.test(nick) && nick) {
        nick = nick.slice(0,-1);
    }
    if(!nick) {
        nick = "Guest" + Math.floor(Math.random()*9000000 + 1000000);
    }
    this.nickname = nick;
    this.password = pass;
    allCookies.setItem("jirc-nickname", nick);
    this.send('CAP',['LS']);
    if(pass) {
        this.send('PASS',[pass]);
    }
    this.send('USER',[nick,nick,nick,':'+nick]);
    this.send('NICK',[nick]);
};

/* Shims */
if(!window.console) {
    window.console = {log: function() {}};
}

if(!String.prototype.trim) {  
    String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,''); };  
}

if(!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () { return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments))); };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

/* Private interface */
jIRCs.prototype.onconnect = function(evt) {
    this.setConnected("Connected");
    this.forEach(this.queue, this.send, this);
    this.queue = [];
};

jIRCs.prototype.ondisconnect = function(evt) {
    // Remove channel windows
    this.forEach(this.channels, function(c, channel) {
        if(channel != 'Status') {
            this.destroyChan(channel);
        }
    }, this);
    this.setConnected("Disconnected");
    
    this.reconnect_delay = 15;
    this.reconnect();
};

jIRCs.prototype.reconnect = function() {
    if(this.reconnect_delay > 0) {
        this.setConnected("Reconnecting in "+this.reconnect_delay+"...");
        this.reconnect_delay--;
        setTimeout(this.reconnect.bind(this), 1000);
    } else {
        this.setConnected("Reconnecting...");
        irc = new jIRCs(this.conn_generator);
        irc.nick(this.nickname, this.password);
        this.forEach(this.displays, function(disobj) {
            disobj.container.innerHTML = "";
            irc.display(disobj.container);
        }, this);
    }
};

jIRCs.prototype.onmessage = function(evt) {
    this.buf += evt.data;
    var lines = this.buf.split("\n");
    this.buf = lines.pop();
    this.forEach(lines, this.parseMessage, this);
};

jIRCs.prototype.send = function(command, args) {
    var msg = command;
    if(typeof args == 'object') {
        msg += ' ' + args.join(' ');
    }
    if(this.conn.readyState == 1) { //OPEN
        this.conn.send(msg + '\r\n');
    } else {
        this.queue.push(msg);
    }
};

jIRCs.prototype.say = function(message, location) {
    if(!location) {
        location = this.nickname;
    }
    this.send('PRIVMSG', [location, ':' + message]);
    this.irc_PRIVMSG(this.nickname, [location, message]);
};
