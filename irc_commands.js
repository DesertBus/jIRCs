jIRCs.prototype.irc_PING = function(prefix, args) {
    this.send('PONG',args);
};

jIRCs.prototype.irc_NICK = function(prefix, args) {
    if(this.getNick(prefix) == this.nickname) {
        this.nickname = args.pop().substr(1);
    }
};

jIRCs.prototype.irc_JOIN = function(prefix, args) { 
    var channel = args.pop().substr(1);
    if(this.getNick(prefix) == this.nickname) {
        this.channels.push(channel);
        this.window = channel;
    }
};

jIRCs.prototype.irc_PRIVMSG = function(prefix, args) { 
    var channel = args.shift();
    var message = args.pop().substr(1);
    if(message.charAt(0) == '\u0001') {
        message = message.split('\u0001')[1];
        if(message.substr(0,6).toUpperCase() == 'ACTION') {
            message = prefix + message.substr(6);
            prefix = '';
        }
    }
    if(channel == this.window) {
        this.renderLine(prefix, message);
    }
};