jIRCs.prototype.url_regex = /(?:(https?|ftp|svn|git):\/\/)?([a-z0-9.\-]+[.][a-z]{2,4})(\/[^\s]*[^\s`!()\[\]{};:'".,<>?«»“”‘’]?)?/ig;

jIRCs.prototype.linkMunger = function(match, protocol, domain, path, offset, string) {
    var url = match;
    if(!protocol)
        url = 'http://' + url;
    return '<a href="' + url + '" target="_blank">' + match + '</a>';
}