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
    this.renderLine(channel, '', prefix + " joined " + channel);
};

jIRCs.prototype.irc_PART = function(prefix, args) { 
    var channel = args.pop();
    this.renderLine(channel, '', prefix + " left " + channel);
    if(this.getNick(prefix) == this.nickname) {
        this.destroyChan(channel);
    }
};

jIRCs.prototype.irc_PRIVMSG = function(prefix, args) { 
    var channel = args.shift();
    var message = args.pop().substr(1);
    //account for private messages
    if (channel == this.nickname)
        channel = prefix;
    if(message.charAt(0) == '\u0001') {
        message = message.split('\u0001')[1];
        if(message.substr(0,6).toUpperCase() == 'ACTION') {
            message = prefix + message.substr(6);
            prefix = '';
        }
    }
    this.renderLine(channel, prefix, message);
};
