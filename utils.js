jIRCs.prototype.url_regex = /(?:(https?|ftp|svn|git):\/\/)?([a-z0-9.\-]+[.][a-z]{2,4})(\/[^\s]*[^\s`!()\[\]{};:'".,<>?«»“”‘’]?)?/ig;

jIRCs.prototype.linkMunger = function(match, protocol, domain, path, offset, string) {
    var url = match;
    if(!protocol)
        url = 'http://' + url;
    return '<a href="' + url + '" target="_blank">' + match + '</a>';
};

jIRCs.prototype.handleLine = function(message, disobj) {
    if(message.charAt(0) == '/') {
        var args = message.substr(1).split(' ');
        var command = args.shift().toUpperCase();
        var method = 'command_' + command;
        if(method in this) {
            this[method](args, disobj);
        } else {
            this.send(command, args);
        }
    } else {
        this.say(message, disobj.window);
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
