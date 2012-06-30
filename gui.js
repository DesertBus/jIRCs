jIRCs.prototype.display = function(height) {
    var scripts = document.getElementsByTagName('script');
    var self = scripts[scripts.length - 1];
    var container = document.createElement('div');
    var chat = document.createElement('div');
    var table = document.createElement('table');
    var form = document.createElement('form');
    var input = document.createElement('input');
    chat.style.height = height+'px';
    chat.style.overflow = 'auto';
    chat.style.border = '1px solid black';
    table.style.width = '100%';
    table.style['border-collapse'] = 'collapse';
    form.irc = this;
    form.onsubmit = function() {
        this.irc.handleLine(this.message.value);
        this.message.value = '';
        return false;
    };
    input.type = 'text';
    input.name = 'message';
    input.style.display = 'block';
    input.style.width = '100%';
    form.appendChild(input);
    chat.appendChild(table);
    container.appendChild(chat);
    container.appendChild(form);
    document.body.insertBefore(container, self);
    this.displays.push(container);
}

jIRCs.prototype.renderLine = function(speaker, message) {
        var now = new Date();
        var h = '' + now.getHours();
        var m = '' + now.getMinutes();
        var s = '' + now.getSeconds();
        var row = document.createElement('tr');
        var date = document.createElement('td');
        var user = document.createElement('td');
        var text = document.createElement('td');
        row.style['border-bottom'] = '1px solid gray';
        date.style.width = '80px';
        user.style.width = '160px';
        user.style['border-right'] = '1px solid gray';
        if(speaker == '')
            text.style['font-style'] = 'italic';
        date.appendChild(document.createTextNode('[' + (h.length > 1 ? h : '0'+h) + ':' + (m.length > 1 ? m : '0'+m) + ':' + (s.length > 1 ? s : '0'+s) + ']'));
        user.appendChild(document.createTextNode(speaker));
        text.appendChild(document.createTextNode(message));
        row.appendChild(date);
        row.appendChild(user);
        row.appendChild(text);
        this.displays.forEach(function(t) {
            var d = t.getElementsByTagName('div')[0];
            var b = (d.scrollHeight < d.clientHeight || d.scrollHeight == d.scrollTop + d.clientHeight);
            t.getElementsByTagName('table')[0].appendChild(row);
            if(b)
                d.scrollTop = d.scrollHeight - d.clientHeight; 
        });
};