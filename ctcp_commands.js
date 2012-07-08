jIRCs.prototype.ctcp_VERSION = function(user, args) {
    var message = '\u0001VERSION ' + this.version + '\u0001';
    this.send('NOTICE', [user, message]);
};

jIRCs.prototype.ctcp_TIME = function(user, args) {
    var message = '\u0001TIME ' + (new Date()).toString() + '\u0001';
    this.send('NOTICE', [user, message]);
};

jIRCs.prototype.ctcp_PING = function(user, args) {
    var message = '\u0001PING ' + args[0] + '\u0001';
    this.send('NOTICE', [user, message]);
};
