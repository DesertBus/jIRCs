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
function jIRCs(conn) {
    this.buf = '';
    this.queue = [];
    this.displays = [];
    this.channels = [];
    this.window = '';
    this.nickname = '';
    this.conn = conn;
    this.conn.parent = this;
    this.conn.onopen = function(e) { this.parent.onconnect(e); };
    this.conn.onmessage = function(e) { this.parent.onmessage(e); };
    this.conn.onclose = function(e) { this.parent.ondisconnect(e); };
}
jIRCs.prototype.nick = function(nick) { this.nickname = nick; this.send('USER',[nick,nick,nick,':'+nick]); this.send('NICK',[nick]); };


jIRCs.prototype.onconnect = function(evt) {
    console.log("Connected");
    this.queue.forEach(this.send, this);
    this.queue = [];
};
jIRCs.prototype.ondisconnect = function(evt) {
    console.log("Disconnected");
};
jIRCs.prototype.onmessage = function(evt) {
    this.buf += evt.data;
    var lines = this.buf.split("\n");
    this.buf = lines.pop();
    lines.forEach(this.parseMessage, this);
};
jIRCs.prototype.send = function(command, args) {
    var msg = command;
    if(typeof args == 'object')
        msg += ' ' + args.join(' ');
    if(this.conn.readyState == 1) { //OPEN
        console.log('>>> ' + msg);
        this.conn.send(msg + '\r\n');
    } else {
        console.log('||| ' + msg);
        this.queue.push(msg);
    }
};
jIRCs.prototype.say = function(message, location) {
    if(!location)
        location = this.window;
    var args = [location, ':' + message];
    this.send('PRIVMSG', args);
    this.irc_PRIVMSG(this.nickname, args);
}
jIRCs.prototype.handleLine = function(message) {
    if(message.charAt(0) == '/') {
        var args = message.substr(1).split(' ');
        var command = args.shift().toUpperCase();
        var method = 'command_' + command;
        if(method in this) {
            this[method](args);
        } else {
            this.send(command, args);
        }
    } else {
        this.say(message);
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
    if(method in this)
        this[method](p, args);
};
jIRCs.prototype.getNick = function(prefix) { return prefix.split('!')[0]; };