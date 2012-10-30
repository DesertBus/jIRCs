jIRCs.prototype.irc_PING = function(prefix, args) {
    this.send('PONG',args);
};

jIRCs.prototype.irc_NICK = function(prefix, args) {
    var oldNick = this.getNick(prefix),
        newNick = args.pop();
    if(oldNick == this.nickname) {
        this.nickname = newNick;
        allCookies.setItem("jirc-nickname", this.nickname);
    }
    this.forEach(this.channels, function(c, channel) {
        if(c.names && oldNick in c.names) {
            this.renderLine(channel, channel, oldNick + ' is now known as ' + newNick);
            c.names[newNick] = c.names[oldNick];
            delete(c.names[oldNick]);
        }
    }, this);
    this.forEach(this.displays, function(disobj) {
        this.render(disobj);
    }, this);
};

jIRCs.prototype.irc_JOIN = function(prefix, args) { 
    var channel = args.pop().toLowerCase();
    if(prefix != this.nickname) {
        //this.renderLine(channel, channel, prefix + " joined " + channel);
    } else {
        this.renderLine(channel, channel, "You have joined " + channel);
    }
    if(!this.channels[channel].names) {
        this.channels[channel].names = {};
    }
    this.channels[channel].names[prefix] = "";
    if (!this.channels[channel].modes) {
        this.channels[channel].modes = {};
        this.send('MODE', [channel]); // Get the initial modes because the server doesn't send them by default
    }
    this.forEach(this.displays, function(disobj) {
        if(channel.charAt(0) == "#" && prefix == this.nickname) {
            this.activateChan(channel, disobj);
        }
        if(disobj.viewing == channel) {
            this.render(disobj);
        }
    }, this);
};

jIRCs.prototype.irc_PART = function(prefix, args) { 
    var channel = args.shift().toLowerCase();
    var reason = args.pop();
    if(this.getNick(prefix) == this.nickname) {
        this.destroyChan(channel);
    } else {
        //this.renderLine(channel, channel, prefix + " left " + channel + " [" + reason + "]");
        delete(this.channels[channel].names[prefix]);
        this.forEach(this.displays, function(disobj) {
            if(disobj.viewing == channel) {
                this.render(disobj);
            }
        }, this);
    }
};

jIRCs.prototype.irc_QUIT = function(prefix, args) { 
    var reason = args.pop();
    this.forEach(this.channels, function(c, channel) {
        if(channel == 'Status') {
            return;
        }
        if(c.names && prefix in c.names) {
            //this.renderLine(channel, channel, prefix + ' quit (' + reason + ')');
            delete(c.names[prefix]);
        }
    }, this);
    if(this.getNick(prefix) == this.nickname) {
        // Let ondisconnect handle cleanup
    } else {
        this.forEach(this.displays, function(disobj) {
            this.render(disobj);
        }, this);
    }
};

jIRCs.prototype.irc_PRIVMSG = function(prefix, args) { 
    var channel = args.shift().toLowerCase();
    var message = args.pop();
    //account for private messages
    if (channel == this.nickname.toLowerCase()) {
        channel = prefix.toLowerCase();
    }
    if (channel.charAt(0) in this.statusSymbols) {
        prefix += ":" + channel; // give a visible indication that the message isn't for the whole channel
        channel = channel.substr(1); // trim the status char off so the message gets displayed to the correct channel
    }
    if(message.charAt(0) == '\u0001') {
        message = message.split('\u0001')[1];
        if(message.substr(0,6).toUpperCase() == 'ACTION') {
            message = prefix + message.substr(6);
            prefix = '';
            this.renderLine(channel, prefix, message);
        } else {
            args = message.split(' ');
            var method = 'ctcp_' + args.shift().toUpperCase();
            console.log("<<<<<< " + method + "('" + channel + "'," + JSON.stringify(args) + ")");
            if(method in this) {
                this[method](channel, args);
            }
        }
    } else {
        this.renderLine(channel, "<"+prefix+">", message);
    }
    if(prefix == "BidServ") {
        var cleaned = message.replace("\u0001","").replace("\u0002","").replace("\u00034","").replace("\u000F","").replace("\u0016","").replace("\u001D","").replace("\u001F","");
        var parts = cleaned.split(" ");
        console.debug(
            cleaned,
            parts,
            parts.slice(0,2).join(" "),
            parts.slice(0,3).join(" "),
            ~cleaned.indexOf("has the high bid of"),
            ~cleaned.indexOf("New highest bid is by"),
            parts.slice(0,1).join(" ") == "Auction for" && ~cleaned.indexOf("cancelled"),
            parts[0] == "Sold!"
        );
        if(parts.slice(0,2).join(" ") == "Starting Auction") {
            var id = parts[4].slice(1,-1);
            var name = parts.slice(5,-4).join(" ").slice(1,-2);
            this.auctionStart(id,name);
        } else if(parts.slice(0,3).join(" ") == "Beginning bidding at") {
            var starting = parts[3];
            this.auctionBid(starting,"Nobody");
        } else if(~cleaned.indexOf("has the high bid of")) { // ~ abuses two's complement notation to make -1 false, and everything else true
            var index = 0;
            while(index < parts.length - 5) {
                if(parts[index+1] == "has" && parts[index+2] == "the" && parts[index+3] == "high" && parts[index+4] == "bid" && parts[index+5] == "of")
                    break;
                index++;
            }
            var bidder = parts[index];
            var bid = parts[index + 6];
            this.auctionBid(bid,bidder);
        } else if(~cleaned.indexOf("New highest bid is by")) {
            parts = cleaned.substr(cleaned.indexOf("New highest bid is by")).split(" ");
            var bidder = parts[5];
            var bid = parts[7];
            this.auctionBid(bid,bidder);
        } else if(parts.slice(0,2).join(" ") == "Auction for" && ~cleaned.indexOf("cancelled")) {
            this.auctionStop();
        } else if(parts[0] == "Sold!") {
            this.auctionStop();
        }
    }
};

jIRCs.prototype.irc_NOTICE = function(prefix, args) {
    var nick = '\u2013 ' + this.getNick(prefix);
    var message = args.pop();
    var dest = args.shift().toLowerCase(); // It'll only be used if it's a channel name, anyway
    if (this.chantypes.indexOf(dest.charAt(0)) !== -1 || this.chantypes.indexOf(dest.charAt(1)) !== -1) { // There may or may not be a channel status in the parameter
        nick += ":" + dest + ' \u2013'; // Give a visible indication that the message is a channel notice
        if (dest.charAt(0) in this.statusSymbols) { // it's not going directly to all of a channel
            dest = dest.substr(1); // display it in the correct window
        }
        this.renderLine(dest, nick, message);
    } else {
        nick += ' \u2013'; // \u2013 is an en-dash
        this.forEach(this.displays, function(disobj) {
            this.renderLine(disobj.viewing, nick, message, disobj);
        }, this);
    }
    if(this.getNick(prefix) == "NickServ") {
        if(message.slice(0,33) == "You are now identified. Welcome, ") {
            this.setAccount(message.slice(33,-1));
        } else if(message.slice(0,22) == "You are now logged out") {
            this.setAccount(false);
        }
    }
};

jIRCs.prototype.irc_MODE = function(prefix, args) {
    var channel = args.shift().toLowerCase();
    var modes = args.shift().split('');
    if (channel == this.nickname.toLowerCase()) { // handle user modes here
        var adding = true;
        this.forEach(modes, function(mode) {
            switch (mode) {
                case '+':
                    adding = true;
                    break;
                case '-':
                    adding = false;
                    break;
                default:
                    if (adding) {
                        this.userModes.push(mode);
                    } else {
                        var modePos = this.userModes.indexOf(mode);
                        if (modePos != -1) {
                            this.userModes.splice(modePos, 1);
                        }
                    }
            }
        }, this);
    } else {
        // At this point, what's left in args is the parameter list
        this.parseModes(channel, modes, args); // handle the channel modes
    }
};

jIRCs.prototype.irc_CAP = function(prefix, args) {
    // :server CAP dest subcommand :capability list
    if (args[1] == "LS") {
        var supportedCaps = args[2].split(' ');
        if (supportedCaps.indexOf("multi-prefix") != -1) {
            this.send("CAP", ["REQ", ":multi-prefix"]);
        } else if (!this.registered) {
            this.send("CAP", ["END"]);
        }
    } else if (args[1] == "ACK" && !this.registered) {
        this.send("CAP", ["END"]);
    }
}

jIRCs.prototype.irc_001 = function(prefix, args) {
    this.registered = true;
}

jIRCs.prototype.irc_005 = function(prefix, args) {
    var server = args.shift();
    var message = args.pop();
    this.forEach(args, function(arg) {
        if(arg.substr(0,7).toUpperCase() == 'PREFIX=') {
            var modes = arg.substr(8).split(')'); // exclude the open paren, split close paren
            var symbols = modes[1].split('');
            var letters = modes[0].split('');
            this.statuses = this.zip(symbols.concat(letters), letters.concat(symbols));
            this.statusOrder = letters;
            this.statusSymbols = this.zip(symbols, symbols);
            this.statuses[''] = '';
            this.statusOrder.push('');
        }
        if (arg.substr(0, 10) == 'CHANMODES=') {
            var modes = arg.substr(10); // get all the channel modes
            var groups = modes.split(',');
            this.forEach(groups, function(group, groupNum) {
                this.forEach(group, function(mode) {
                    this.chanModes[mode] = groupNum; // map modes to their group index for easy lookup
                }, this);
            }, this);
        }
        if (arg.substr(0, 10) == 'CHANTYPES=') {
            this.chantypes = arg.substr(10).split('');
        }
    }, this);
};

jIRCs.prototype.irc_324 = function(prefix, args) {
    args.shift(); // discard our nick; it's not useful
    var channel = args.shift().toLowerCase();
    var modes = args.shift().split('');
    // At this point, what's left in args (if anything) is the mode parameter list
    this.channels[channel].modes = {}; // Reset the channel modes list as 324 is all of the channel's current modes
    this.parseModes(channel, modes, args);
};

jIRCs.prototype.irc_353 = function(prefix, args) {
    var channel = args[2].toLowerCase();
    if (!this.channels[channel].moreNames) {
        this.channels[channel].names = {};
        this.channels[channel].moreNames = true;
    }
    var names = args[3].split(' '); // Strip the colon and split the names out
    this.forEach(names, function(name) {
        var statusList = '';
        while (name.charAt(0) in this.statusSymbols) {
            statusList += name.charAt(0);
            name = name.substr(1);
        }
        this.channels[channel].names[name] = statusList;
    }, this);
};

jIRCs.prototype.irc_366 = function(prefix, args) {
    var channel = args[1].toLowerCase();
    this.channels[channel].moreNames = false;
    this.forEach(this.displays, function(disobj) {
        if(disobj.viewing == channel) {
            this.render(disobj);
        }
    }, this);
};

jIRCs.prototype.irc_332 = function(prefix, args) {
    var channel = args[1].toLowerCase();
    if(!this.channels[channel].topic) {
        this.channels[channel].topic = {};
    }
    this.channels[channel].topic.message = args[2];
    this.forEach(this.displays, function(disobj) {
        if(disobj.viewing == channel) {
            this.render(disobj);
        }
    }, this);
};

jIRCs.prototype.irc_333 = function(prefix, args) {
    var channel = args[1].toLowerCase();
    if(!this.channels[channel].topic) {
        this.channels[channel].topic = {};
    }
    this.channels[channel].topic.creator = args[2];
    this.channels[channel].topic.time = new Date(args[3] * 1000);
    this.forEach(this.displays, function(disobj) {
        if(disobj.viewing == channel) {
            this.render(disobj);
        }
    }, this);
};

jIRCs.prototype.irc_TOPIC = function(prefix, args) {
    var channel = args[0].toLowerCase();
    if(!this.channels[channel].topic) {
        this.channels[channel].topic = {};
    }
    this.channels[channel].topic.creator = prefix;
    this.channels[channel].topic.time = new Date();
    this.channels[channel].topic.message = args[1];
    this.forEach(this.displays, function(disobj) {
        if(disobj.viewing == channel) {
            this.render(disobj);
        }
    }, this);
};

jIRCs.prototype.irc_433 = function(prefix, args) {
    this.nickname += "_";
    allCookies.setItem("jirc-nickname", this.nickname);
    this.send('NICK',[this.nickname]);
};

jIRCs.prototype.irc_unknown = function(prefix, args) {
    if(args[0] == this.nickname)
        args.shift();
    this.renderLine("Status", prefix, args.join(" "));
};
