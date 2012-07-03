jIRCs.prototype.ctcp_VERSION = function(user, args) {
    var message = '\u0001VERSION ' + this.version + '\u0001';
    this.send('NOTICE', [user, message]);
};