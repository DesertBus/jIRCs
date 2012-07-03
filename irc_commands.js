jIRCs.prototype.irc_PING = function(prefix, args) {
    this.send('PONG',args);
};

jIRCs.prototype.irc_NICK = function(prefix, args) {
    var oldNick = this.getNick(prefix),
        newNick = args.pop().substr(1);
    if(oldNick == this.nickname) {
        this.nickname = newNick;
    }
    for(var channel in this.channels) {
        if(this.channels.hasOwnProperty(channel) && 'names' in this.channels[channel] && oldNick in this.channels[channel].names) {
            this.renderLine(channel,'',oldNick + ' is now known as ' + newNick);
            this.channels[channel].names[newNick] = this.channels[channel].names[oldNick];
            delete(this.channels[channel].names[oldNick]);
        }
    }
    this.displays.forEach(function(disobj) {
        this.renderUserlist(disobj);
    }, this);
};

jIRCs.prototype.irc_JOIN = function(prefix, args) { 
    var channel = args.pop().substr(1).toLowerCase();
    if(prefix != this.nickname) {
        this.renderLine(channel, '', prefix + " joined " + channel);
    } else {
        this.renderLine(channel, '', "You have joined " + channel);
    }
    if(!this.channels[channel].names) {
        this.channels[channel].names = {};
    }
    this.channels[channel].names[prefix] = "";
    this.displays.forEach(function(disobj) {
        if(document.activeElement == disobj.messagebox && prefix == this.nickname) {
            this.activateChan(channel, disobj);
        }
        if(disobj.window == channel) {
            this.renderUserlist(disobj);
        }
    }, this);
};

jIRCs.prototype.irc_PART = function(prefix, args) { 
    var channel = args.pop().toLowerCase();
    if(this.getNick(prefix) == this.nickname) {
        this.destroyChan(channel);
    } else {
        this.renderLine(channel, '', prefix + " left " + channel);
        delete(this.channels[channel].names[prefix]);
        this.displays.forEach(function(disobj) {
            if(disobj.window == channel) {
                this.renderUserlist(disobj);
            }
        }, this);
    }
};

jIRCs.prototype.irc_QUIT = function(prefix, args) { 
    var reason = args.pop().substr(1);
    for(var channel in this.channels) {
        if(channel == "Status") {
            continue;
        }
        if(this.channels[channel].names && prefix in this.channels[channel].names) {
            this.renderLine(channel, '', prefix + " quit (" + reason + ")");
            delete(this.channels[channel].names[prefix]);
        }
    }
    if(this.getNick(prefix) == this.nickname) {
        // This is never triggered
        for(var channel in this.channels) {
            if(channel != 'Status') {
                this.destroyChan(channel);
            }
        }
    } else {
        this.displays.forEach(function(disobj) {
            this.renderUserlist(disobj);
        }, this);
    }
};

jIRCs.prototype.irc_PRIVMSG = function(prefix, args) { 
    var channel = args.shift().toLowerCase();
    var message = args.pop().substr(1);
    //account for private messages
    if (channel == this.nickname) {
        channel = prefix;
    }
    if(message.charAt(0) == '\u0001') {
        message = message.split('\u0001')[1];
        if(message.substr(0,6).toUpperCase() == 'ACTION') {
            message = prefix + message.substr(6);
            prefix = '';
        }
    }
    this.renderLine(channel, prefix, message);
};

jIRCs.prototype.irc_005 = function(prefix, args) {
    for (var i = 1; i < args.length - 1; i++) { // skip the nickname and the "is supported by this server" message
        if (args[i].substr(0,7) == "PREFIX=") {
            this.statuses = {};
            var modes = args[i].substr(8).split(')'); // exclude the open paren, split close paren
            for (var j = 0; j < modes[0].length; j++) {
                this.statuses[modes[1][j]] = modes[0][j]; // mapping of symbols to modes
                this.statusOrder.push(modes[0][j]); // most important first
            }
            this.statuses[''] = '';
            this.statusOrder.push('');
        }
    }
};

jIRCs.prototype.irc_353 = function(prefix, args) {
    var channel = args[2].toLowerCase();
    if (!this.channels[channel].moreNames) {
        this.channels[channel].names = {};
        this.channels[channel].moreNames = true;
    }
    var names = args[3].substr(1).split(' '); // Strip the colon and split the names out
    names.forEach(function(name) {
        var statusList = '';
        while (name.charAt(0) in this.statuses) {
            statusList += name.charAt(0);
            name = name.substr(1);
        }
        this.channels[channel].names[name] = statusList;
    }, this);
};

jIRCs.prototype.irc_366 = function(prefix, args) {
    var channel = args[1].toLowerCase();
    this.channels[channel].moreNames = false;
    this.displays.forEach(function(disobj) {
        if(disobj.window == channel) {
            this.renderUserlist(disobj);
        }
    }, this);
};

jIRCs.prototype.irc_332 = function(prefix, args) {
    var channel = args[1].toLowerCase();
    if(!this.channels[channel].topic) {
        this.channels[channel].topic = {};
    }
    this.channels[channel].topic.message = args[2].substr(1);
    this.displays.forEach(function(disobj) { if(disobj.window == channel) this.renderTopic(disobj); }, this);
};

jIRCs.prototype.irc_333 = function(prefix, args) {
    var channel = args[1].toLowerCase();
    if(!this.channels[channel].topic) {
        this.channels[channel].topic = {};
    }
    this.channels[channel].topic.creator = args[2];
    this.channels[channel].topic.time = new Date(args[3] * 1000);
    this.displays.forEach(function(disobj) { if(disobj.window == channel) this.renderTopic(disobj); }, this);
};

jIRCs.prototype.irc_TOPIC = function(prefix, args) {
    var channel = args[0].toLowerCase();
    if(!this.channels[channel].topic) {
        this.channels[channel].topic = {};
    }
    this.channels[channel].topic.creator = prefix;
    this.channels[channel].topic.time = new Date();
    this.channels[channel].topic.message = args[1].substr(1);
    this.displays.forEach(function(disobj) { if(disobj.window == channel) this.renderTopic(disobj); }, this);
};
