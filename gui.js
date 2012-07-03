jIRCs.prototype.display = function(domobj) {
    if (!domobj) {
        var scripts = document.getElementsByTagName('script');
        domobj = scripts[scripts.length - 1].parentNode;
    }
    var container = document.createElement('table');
    var windowR = document.createElement('tr');
    var tabbarR = document.createElement('tr');
    var topicR = document.createElement('tr');
    var formR = document.createElement('tr');
    var formD = document.createElement('td');
    var windowD = document.createElement('td');
    var userlistD = document.createElement('td');
    var window = document.createElement('div');
    var tabbar = document.createElement('td');
    var topic = document.createElement('td');
    var userlist = document.createElement('div');
    var form = document.createElement('form');
    var input = document.createElement('input');
    var disobj = {
        'container': container,
        'messagebox': input,
        'tabBar': tabbar,
        'topic': topic,
        'userlist': userlist,
        'userlistD': userlistD,
        'form': form,
        'chatWindow': window,
        'channels': {},
        'window': '',
        'windowHistory': [],
        'height': domobj.clientHeight
    };
    container.className = "jircs_main";
    tabbar.className = "jircs_tabBar";
    topic.className = "jircs_topic";
    userlist.className = "jircs_userlist";
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
    container.addEventListener("mousedown", function(e) {
        disobj.mouse = {'x':e.screenX,'y':e.screenY};
    });
    container.addEventListener("mouseup", function(e) {
        if(!('mouse' in disobj && 'x' in disobj.mouse && 'y' in disobj.mouse)) {
            input.focus();
        }
        var dx = disobj.mouse.x - e.screenX,
            dy = disobj.mouse.y - e.screenY;
        if(dx < 0) dx *= -1;
        if(dy < 0) dy *= -1;
        if(dx < 5 && dy < 5 && e.button == 0) //Make sure text selection works as expected 
            input.focus();
    });
    form.addEventListener("submit", function(e) {
        self.handleLine(input.value, disobj);
        input.value = '';
        e.preventDefault();
    });
    input.type = 'text';
    input.addEventListener("keydown", function(e) {
        var keyCode = e.keyCode || e.which; 
        if(keyCode == 9) {
            // Get cursor position
            var cursor = 0;
            if (e.target.createTextRange) {
                var r = document.selection.createRange().duplicate();
                r.moveEnd('character', e.target.value.length);
                if (r.text == '') {
                    cursor = e.target.value.length;
                }
                cursor = e.target.value.lastIndexOf(r.text);
            } else {
                cursor = e.target.selectionStart;
            }
            var begin = e.target.value.lastIndexOf(' ',cursor) + 1;
            var end = e.target.value.indexOf(' ',cursor);
            if(end == -1) {
                end = e.target.value.length;
            }
            var name = e.target.value.substring(begin,end);
            var possible = [];
            // Complete the name
            for(var n in self.channels[disobj.window].names) {
                if(self.channels[disobj.window].names.hasOwnProperty(n) && n.substring(0,name.length).toLowerCase() == name.toLowerCase()) {
                    possible.push(n);
                }
            }
            if(possible.length == 1) {
                name = possible[0];
            } else if(possible.length == 0) {
                self.renderLine(disobj.window,'','No Possible Nicknames');
            } else {
                self.renderLine(disobj.window,'','Possible Nicknames: '+possible.join(' '));
            }
            e.target.value = e.target.value.substring(0,begin) + name + e.target.value.substr(end);
            e.preventDefault();
        }
    });
    form.appendChild(input);
    tabbar.colSpan = 2;
    topic.colSpan = 2;
    formD.colSpan = 2;
    formD.appendChild(form);
    windowD.appendChild(window);
    userlistD.appendChild(userlist);
    formR.appendChild(formD);
    windowR.appendChild(windowD);
    windowR.appendChild(userlistD);
    tabbarR.appendChild(tabbar);
    topicR.appendChild(topic);
    container.appendChild(tabbarR);
    container.appendChild(topicR);
    container.appendChild(windowR);
    container.appendChild(formR);
    domobj.appendChild(container);
    this.fixHeights(disobj);
    //set up Status window
    this.initChan("Status", disobj);
    this.activateChan("Status", disobj);
    this.displays.push(disobj);
};

jIRCs.prototype.initChan = function(channel, disobj) {
    var table = document.createElement('table');
    var tab = document.createElement('span');
    table.className = "jircs_chatTable";
    tab.className = "jircs_tab";
    tab.appendChild(document.createTextNode(channel));
    self = this;
    tab.addEventListener("click", function() {
        self.activateChan(channel, disobj);
    });
    if (channel != "Status") {
        var closeBtn = document.createElement("span");
        closeBtn.appendChild(document.createTextNode("X"));
        closeBtn.addEventListener("click", function() {
            self.destroyChan(channel);
        });
        closeBtn.className = "jircs_tab_closeBtn";
        tab.appendChild(closeBtn);
    }
    disobj.tabBar.appendChild(tab);
    table.style.display = "none"; //hide new channel
    disobj.chatWindow.appendChild(table);
    disobj.channels[channel] = {'table': table, 'tab': tab};
};

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
            while (newchan && !disobj.channels[newchan]) {
                newchan = disobj.windowHistory.pop() || false;
            }
            if(!newchan) {
                newchan = 'Status';
            }
            this.activateChan(newchan, disobj);
        }, this);
        delete(this.channels[channel]);
    }   
};

jIRCs.prototype.activateChan = function(channel, disobj) {
    if (disobj.channels[channel] && disobj.window != channel) {
        this.displays.forEach(function(idisobj) {
            for (var chan in idisobj.channels) {
                var newClass = 'jircs_tab';
                if(idisobj == disobj)
                    disobj.channels[chan].table.style.display = "none";
                else if(idisobj.channels[chan].tab.className.indexOf("jircs_tab_active") >= 0)
                    newClass += ' jircs_tab_active';
                if(chan != channel) {
                    if(idisobj.channels[chan].tab.className.indexOf("jircs_tab_attention") >= 0)
                        newClass += " jircs_tab_attention"
                    if(idisobj.channels[chan].tab.className.indexOf("jircs_tab_hilight") >= 0)
                        newClass += " jircs_tab_hilight"
                }
                idisobj.channels[chan].tab.className = newClass;  
            }
        }, this);
        disobj.channels[channel].table.style.display = "table";
        disobj.channels[channel].tab.className += " jircs_tab_active";
        disobj.windowHistory.push(disobj.window);
        disobj.window = channel;
        this.renderTopic(disobj);
        this.renderUserlist(disobj);
    }
};

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
        var nickCheck = new RegExp("\\b"+this.nickname+"\\b");
        if(nickCheck.test(message)) { // Hilight
            row.className += " jircs_hilight";
        }
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
            var b = (disobj.chatWindow.scrollHeight < disobj.chatWindow.clientHeight || disobj.chatWindow.scrollHeight <= disobj.chatWindow.scrollTop + disobj.chatWindow.clientHeight + 5); // 5px buffer just in case
            var r = row.cloneNode(true);
            r.innerHTML = r.innerHTML.replace(/([>\s])(#[^\s\a,:]+?)([<\s])/ig,'$1<a href="$2" class="jircs_channel_link">$2</a>$3'); // Auto-linkify channels
            disobj.channels[channel].table.appendChild(r);
            if(b) disobj.chatWindow.scrollTop = disobj.chatWindow.scrollHeight - disobj.chatWindow.clientHeight; // Only scroll when user is at the bottom
            if (open.indexOf(channel) == -1) {
                if(disobj.channels[channel].tab.className.indexOf("jircs_tab_attention") == -1)
                    disobj.channels[channel].tab.className += " jircs_tab_attention";
                if(disobj.channels[channel].tab.className.indexOf("jircs_tab_hilight") == -1 && nickCheck.test(message))
                    disobj.channels[channel].tab.className += " jircs_tab_hilight";
            }
        }, this);
};

jIRCs.prototype.renderTopic = function(disobj) {
    disobj.topic.innerHTML = "";
    if(!(disobj.window in this.channels && this.channels[disobj.window].topic)) {
        this.fixHeights(disobj);
        return;
    }
    var tmsg = document.createElement('p');
    tmsg.appendChild(document.createTextNode(this.channels[disobj.window].topic.message));
    tmsg.className = 'jircs_topic_message';
    disobj.topic.appendChild(tmsg);
    if(this.channels[disobj.window].topic.creator) {
        var tcreator = document.createElement('p');
        var msg = 'Set by ' + this.channels[disobj.window].topic.creator;
        if(this.channels[disobj.window].topic.time) { 
            var t = this.channels[disobj.window].topic.time;
            var h = '' + t.getHours();
            var m = '' + t.getMinutes();
            var s = '' + t.getSeconds();
            msg += ' on ' + (t.getMonth() + 1) + '/' + t.getDate() + '/' + t.getFullYear() + ' ' + (h.length > 1 ? h : '0'+h) + ':' + (m.length > 1 ? m : '0'+m) + ':' + (s.length > 1 ? s : '0'+s);
        }
        tcreator.appendChild(document.createTextNode(msg));
        tcreator.className = 'jircs_topic_creator';
        disobj.topic.appendChild(tcreator);
    }
    this.fixHeights(disobj);
};

jIRCs.prototype.renderUserlist = function(disobj) {
    disobj.userlist.innerHTML = "";
    disobj.userlistD.style.width = '0px';
    if(!(disobj.window in this.channels))
        return;
    var users = {};
    var prefix = '', rank = '';
    for(var u in this.channels[disobj.window].names) {
        prefix = this.channels[disobj.window].names[u];
        if(prefix.length) prefix = prefix.charAt(0);
        rank = prefix in this.statuses ? this.statuses[prefix] : '';
        if(!(rank in users))
            users[rank] = [];
        users[rank].push(prefix + u);
    }
    this.statusOrder.forEach(function(r) {
        if(!(r in users))
            return;
        var ulist = users[r];
        // Case insensitive sort
        ulist.sort(function(a,b) { if(a.toLowerCase() > b.toLowerCase()) return 1; if(a.toLowerCase() < b.toLowerCase()) return -1; return 0;});
        console.log(ulist);
        ulist.forEach(function(u) {
            var p = document.createElement('p');
            p.appendChild(document.createTextNode(u));
            p.className = 'jircs_userlist_user';
            disobj.userlist.appendChild(p);
        }, this);
    }, this);
    disobj.userlistD.style.width = (disobj.userlist.scrollWidth + 20) + 'px';
    disobj.userlist.scrollTop = 0;
};

jIRCs.prototype.fixHeights = function(disobj) {
    disobj.chatWindow.style.height = disobj.userlist.style.height = '0px';
    var h = (disobj.height - disobj.container.offsetHeight) + 'px';
    console.log(h);
    disobj.chatWindow.style.height = disobj.userlist.style.height = h;
};
