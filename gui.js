jIRCs.prototype.display = function(domobj) {
    /* Javascript fires as soon as the script element is parsed
    * so we don't need to go find the script, we can just append
    * to the end of the document.body and we'll end up in the same place.
    * if people want to aim jIRCs at a container, they can provide domobj.
    *var scripts = document.getElementsByTagName('script');
    *var self = scripts[scripts.length - 1];
    */
    if (!domobj)
        domobj = document.body;
    var container = document.createElement('div');
    var window = document.createElement('div');
    var tabbar = document.createElement('div');
    var form = document.createElement('form');
    var input = document.createElement('input');
    container.className = "jircs_main";
    tabbar.className = "jircs_tabBar";
    form.className = "jircs_form";
    input.className = "jircs_input";
    window.className = "jircs_window";
    self = this;
    form.onsubmit = function() {
        self.handleLine(self.messagebox.value);
        self.messagebox.value = '';
        return false;
    };
    input.type = 'text';
    form.appendChild(input);
    //give focus to input box whenever chat is clicked
    container.onclick = function() {
        input.focus();
    };
    container.appendChild(tabbar);
    container.appendChild(window);
    container.appendChild(form);
    domobj.appendChild(container);
    this.container = container;
    this.messagebox = input;
    this.tabBar = tabbar;
    this.form = form;
    this.chatWindow = window;
    //set up Status window
    this.initChan("Status");
    this.activateChan("Status");
}
jIRCs.prototype.initChan = function(channel) {
    var chat = document.createElement('div');
    var table = document.createElement('table');
    var tab = document.createElement('span');
    chat.className = "jircs_channel";
    table.className = "jircs_chatTable";
    tab.className = "jircs_tab";
    tab.appendChild(document.createTextNode(channel));
    self = this;
    tab.onclick = function() {
        self.activateChan(channel);
    };
    if (channel != "Status") {
        var closeBtn = document.createElement("span");
        closeBtn.appendChild(document.createTextNode("X"));
        closeBtn.onclick = function() {
            self.destroyChan(channel);
        };
        closeBtn.className = "jircs_tab_closeBtn";
        tab.appendChild(closeBtn);
    }
    chat.appendChild(table);
    this.tabBar.appendChild(tab);
    chat.tab = tab;
    chat.table = table;
    chat.style.visibility = "hidden"; //hide new channel
    this.chatWindow.appendChild(chat);
    this.displays[channel] = chat;
}
jIRCs.prototype.destroyChan = function(channel) {
    if (channel != 'Status' && this.displays[channel]) {
       //part channel
       this.send("PART",channel);
       //remove from DOM
       this.tabBar.removeChild(this.displays[channel].tab);
       this.chatWindow.removeChild(this.displays[channel]);
       //destroy
       delete(this.displays[channel]);
       //pick a channel to activate
       var newchan = this.windowHistory.pop();
       while (!this.display[newchan]) newchan = this.windowHistory.pop();
       this.activateChan(newchan);
    }   
}
jIRCs.prototype.activateChan = function(channel) {
    if (this.displays[channel] && this.window != channel) {
        for (var chan in this.displays) {
            this.displays[chan].style.visibility = "hidden";
            if (this.displays[chan].tab.className.indexOf("jircs_tab_attention") >= 0 && chan != channel)
                this.displays[chan].tab.className = "jircs_tab jircs_tab_attention"
            else 
                this.displays[chan].tab.className = "jircs_tab";
        }
        this.displays[channel].style.visibility = "visible";
        this.displays[channel].tab.className += " jircs_tab_active";
        this.windowHistory.push(this.window);
        this.window = channel;
    }
}
jIRCs.prototype.renderLine = function(channel, speaker, message) {
        if (!channel)
            channel = "Status";
        var now = new Date();
        var h = '' + now.getHours();
        var m = '' + now.getMinutes();
        var s = '' + now.getSeconds();
        var row = document.createElement('tr');
        var date = document.createElement('td');
        var user = document.createElement('td');
        var text = document.createElement('td');
        row.className = "jircs_chatRow";
        date.className = "jircs_chatDate";
        user.className = "jircs_chatUser";
        text.className = "jircs_chatText";
        date.appendChild(document.createTextNode('[' + (h.length > 1 ? h : '0'+h) + ':' + (m.length > 1 ? m : '0'+m) + ':' + (s.length > 1 ? s : '0'+s) + ']'));
        user.appendChild(document.createTextNode(speaker));
        text.appendChild(document.createTextNode(message));
        row.appendChild(date);
        if(speaker == '') {
            text.className += " jircs_action";
            text.colSpan = 2;
        }
        else
            row.appendChild(user);
        row.appendChild(text);
        /* Auto-linkify links */
        text.innerHTML = text.innerHTML.replace(this.url_regex, this.linkMunger);
        if (!this.displays[channel])
            this.initChan(channel);
        this.displays[channel].table.appendChild(row);
        this.displays[channel].scrollTop += 100; //always attempt to scroll, it'll actually only scroll if it needs to. 
        if (channel != this.window)
            this.displays[channel].tab.className += " jircs_tab_attention";
};
