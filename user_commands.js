jIRCs.prototype.command_ME = function(args) {
    var message = '\u0001ACTION ' + args.join(' ') + '\u0001';
    this.say(message);
};

jIRCs.prototype.command_CTCP = function(args) {
    var target = args.shift();
    var message = '\u0001' + args.join(' ') + '\u0001';
    this.say(message, target);
}

jIRCs.prototype.command_MSG = function(args) {
    var target = args.shift();
    this.say(args.join(' '), target);
}