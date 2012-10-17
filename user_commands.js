jIRCs.prototype.command_NICK = function(args, disobj) {
    if(/^\w+$/.test(args[0])) {
        this.send('NICK',args);
    } else {
        this.renderLine(disobj.viewing,'',args[0]+' is an invalid nickname. Please try another.');
    }
};

jIRCs.prototype.command_ME = function(args, disobj) {
    var message = '\u0001ACTION ' + args.join(' ') + '\u0001';
    this.say(message, disobj.viewing);
};

jIRCs.prototype.command_CTCP = function(args) {
    var target = args.shift();
    var message = '\u0001' + args.join(' ') + '\u0001';
    this.say(message, target);
};

jIRCs.prototype.command_MSG = function(args) {
    var target = args.shift();
    this.say(args.join(' '), target);
};

jIRCs.prototype.command_PART = function(args) {
    var channel = args.shift().toLowerCase();
    this.destroyChan(channel);
};
