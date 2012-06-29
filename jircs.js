/* Public interface */
function IRC(conn) {
    this.id = this.rand(1000,9999);
	this.buf = '';
	this.queue = [];
    this.conn = conn;
	this.conn.parent = this;
    this.conn.onopen = function(e) { this.parent.onconnect(e); };
    this.conn.onmessage = function(e) { this.parent.onmessage(e); };
    this.conn.onclose = function(e) { this.parent.ondisconnect(e); };
}
IRC.prototype.nick = function(nick) { this.send('USER',[nick,nick,nick,':'+nick]); this.send('NICK',[nick]); };
/* Private interface */
IRC.prototype.rand = function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
IRC.prototype.irc_PING = function(prefix, args) { this.send('PONG',args); };
IRC.prototype.send = function(command, args) {
	var msg = command;
	if(typeof args == 'object')
		msg += ' ' + args.join(' ');
	if(this.conn.readyState == this.conn.OPEN) {
		console.log('>>> ' + msg);
		this.conn.send(msg + '\r\n');
	} else {
		console.log('||| ' + msg);
		this.queue.push(msg);
	}
};
IRC.prototype.onconnect = function(evt) {
	console.log("Connected");
	this.queue.forEach(this.send, this);
	this.queue = [];
};
IRC.prototype.ondisconnect = function(evt) {
	console.log("Disconnected");
};
IRC.prototype.onmessage = function(evt) {
	this.buf += evt.data;
	var lines = this.buf.split("\n");
	this.buf = lines.pop();
	lines.forEach(this.parseMessage, this);
};
IRC.prototype.parseMessage = function(s) {
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
        args = s.split(' :');
        trailing = ':'+args[1];
        args = args[0].split(' ');
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