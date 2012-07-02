jIRCs.prototype.display = function(domobj) {
    if (!domobj) {
        var scripts = document.getElementsByTagName('script');
        domobj = scripts[scripts.length - 1].parentNode;
    }
    var container = document.createElement('div');
    var window = document.createElement('div');
    var tabbar = document.createElement('div');
    var form = document.createElement('form');
    var input = document.createElement('input');
    var disobj = {
        'container': container,
        'messagebox': input,
        'tabBar': tabbar,
        'form': form,
        'chatWindow': window,
        'channels': {},
        'window': '',
        'windowHistory': []
    };
    container.className = "jircs_main";
    tabbar.className = "jircs_tabBar";
    form.className = "jircs_form";
    input.className = "jircs_input";
    window.className = "jircs_window";
    self = this;
    container.addEventListener("click", function(e) {
        if(e.target && e.target.className == 'jircs_channel_link') {
            self.send('JOIN',[e.target.innerHTML]);
            e.preventDefault();
        }
    });
    form.onsubmit = function() {
        self.handleLine(input.value, disobj);
        input.value = '';
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
    //set up Status window
    this.initChan("Status", disobj);
    this.activateChan("Status", disobj);
    this.displays.push(disobj);
}
jIRCs.prototype.initChan = function(channel, disobj) {
    var table = document.createElement('table');
    var tab = document.createElement('span');
    table.className = "jircs_chatTable";
    tab.className = "jircs_tab";
    tab.appendChild(document.createTextNode(channel));
    self = this;
    tab.onclick = function() {
        self.activateChan(channel, disobj);
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
    disobj.tabBar.appendChild(tab);
    table.style.display = "none"; //hide new channel
    disobj.chatWindow.appendChild(table);
    disobj.channels[channel] = {'table': table, 'tab': tab};
}
jIRCs.prototype.destroyChan = function(channel) {
    if (channel != 'Status' && channel in this.channels) {
       //part channel
       this.send("PART",[channel]);
       //Iterate through displays
       this.displays.forEach(function(disobj) {
           //remove from DOM
           disobj.tabBar.removeChild(disobj.channels[channel].tab);
           disobj.chatWindow.removeChild(disobj.channels[channel].table);
           //destroy
           delete(disobj.channels[channel]);
           //pick a channel to activate
           var newchan = disobj.windowHistory.pop();
           while (newchan && !disobj.channels[newchan]) newchan = disobj.windowHistory.pop() || false;
           if(!newchan) newchan = 'Status';
           this.activateChan(newchan, disobj);
       }, this);
       delete(this.channels[channel]);
    }   
}
jIRCs.prototype.activateChan = function(channel, disobj) {
    if (disobj.channels[channel] && disobj.window != channel) {
        this.displays.forEach(function(idisobj) {
            for (var chan in idisobj.channels) {
                var fixer = '';
                if(idisobj == disobj)
                    disobj.channels[chan].table.style.display = "none";
                else if(idisobj.channels[chan].tab.className.indexOf("jircs_tab_active") >= 0)
                    fixer = ' jircs_tab_active';
                if (idisobj.channels[chan].tab.className.indexOf("jircs_tab_attention") >= 0 && chan != channel)
                    idisobj.channels[chan].tab.className = "jircs_tab jircs_tab_attention"
                else 
                    idisobj.channels[chan].tab.className = "jircs_tab";
                idisobj.channels[chan].tab.className += fixer;  
            }
        }, this);
        disobj.channels[channel].table.style.display = "table";
        disobj.channels[channel].tab.className += " jircs_tab_active";
        disobj.windowHistory.push(disobj.window);
        disobj.window = channel;
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
        text.innerHTML = text.innerHTML.replace(this.url_regex, this.linkMunger); // Auto-linkify links
        if(!(channel in this.channels))
            this.channels[channel] = {} // Add a new object in which we can store channel data
        // Track open channels
        var open = [];
        for(var d in this.displays)
            open.push(this.displays[d].window);
        this.displays.forEach(function(disobj) {
            if (!disobj.channels[channel])
                this.initChan(channel, disobj);
            var b = (disobj.chatWindow.scrollHeight < disobj.chatWindow.clientHeight || disobj.chatWindow.scrollHeight == disobj.chatWindow.scrollTop + disobj.chatWindow.clientHeight);
            var r = row.cloneNode(true);
            r.innerHTML = r.innerHTML.replace(/([>\s])(#[^\s\a,:]+?)([<\s])/ig,'$1<a href="$2" class="jircs_channel_link">$2</a>$3'); // Auto-linkify channels
            disobj.channels[channel].table.appendChild(r);
            if(b) disobj.chatWindow.scrollTop = disobj.chatWindow.scrollHeight - disobj.chatWindow.clientHeight; // Only scroll when user is at the bottom
            if (open.indexOf(channel) == -1)
                disobj.channels[channel].tab.className += " jircs_tab_attention";
        }, this);
};
