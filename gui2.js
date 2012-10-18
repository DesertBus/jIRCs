jIRCs.prototype.display = function(container) {
    if (!container) {
        var scripts = document.getElementsByTagName('script');
        container = scripts[scripts.length - 1].parentNode;
    }
    
    // Create the DOM
    var tabbar = document.createElement('div');
    var topic = document.createElement('div');
    var window = document.createElement('div');
    var chat = document.createElement('div');
    var messages = document.createElement('div');
    var notificiation = document.createElement('div');
    var userlist = document.createElement('div');
    var inputbar = document.createElement('div');
    var status = document.createElement('div');
    var form = document.createElement('form');
    var name = document.createElement('label');
    var input = document.createElement('input');
    var send = document.createElement('input');
    
    // Save the display object
    var disobj = {
        // DOM
        'container': container,
        'tabbar': tabbar,
        'topic': topic,
        'window': window,
        'chat': chat,
        'messages': messages,
        'notificiation': notificiation,
        'userlist': userlist,
        'inputbar': inputbar,
        'status': status,
        'form': form,
        'name': name,
        'input': input,
        'send': send,
        // Vars
        'viewing': '',
        'tabs': {},
        'lines': {},
        'history': [],
        'options': {
            'show_userlist': true,
            'show_auction': true
        }
    };
    
    // Set all them fancy classes
    container.className = "jircs_main";
    tabbar.className = "jircs_tabbar";
    topic.className = "jircs_topic";
    window.className = "jircs_window";
    chat.className = "jircs_chat";
    messages.className = "jircs_messages";
    notificiation.className = "jircs_notificiation";
    userlist.className = "jircs_userlist";
    inputbar.className = "jircs_inputbar";
    status.className = "jircs_status";
    form.className = "jircs_form";
    name.className = "jircs_name";
    input.className = "jircs_input";
    send.className = "jircs_send";
    
    // Set values and styles
    container.style.overflow = "hidden";
    //window.style.minHeight = "300px";
    chat.style.display = "inline-block";
    userlist.style.display = "inline-block";
    form.style.display = "inline-block";
    input.style.display = "inline-block";
    input.type = 'text';
    send.type = "submit";
    send.value = "Send";
    
    // Attach all those elements together
    container.appendChild(tabbar);
    container.appendChild(topic);
    container.appendChild(window);
    container.appendChild(inputbar);
    container.appendChild(status);
    window.appendChild(chat);
    window.appendChild(userlist);
    chat.appendChild(messages);
    chat.appendChild(notificiation);
    inputbar.appendChild(form);
    form.appendChild(name);
    form.appendChild(input);
    form.appendChild(send);
    
    // Add event listeners
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
        var dx = disobj.mouse.x - e.screenX, dy = disobj.mouse.y - e.screenY;
        if(dx < 0) {
            dx *= -1;
        }
        if(dy < 0) {
            dy *= -1;
        }
        if(dx < 5 && dy < 5 && e.button == 0) { //Make sure text selection works as expected 
            input.focus();
        }
    });
    form.addEventListener("submit", function(e) {
        self.handleLine(input.value, disobj);
        input.value = '';
        e.preventDefault();
    });
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
            self.forEach(self.channels[disobj.viewing].names, function(status, n) {
                if(n.substring(0,name.length).toLowerCase() == name.toLowerCase()) {
                    possible.push(n);
                }
            }, self);
            if(possible.length == 1) {
                name = possible[0];
            } else if(possible.length == 0) {
                self.renderLine(disobj.viewing,'','No Possible Nicknames');
            } else {
                self.renderLine(disobj.viewing,'','Possible Nicknames: '+possible.join(' '));
            }
            e.target.value = e.target.value.substring(0,begin) + name + e.target.value.substr(end);
            e.preventDefault();
        }
    });
    
    //set up Status window
    this.initChan("Status", disobj);
    this.activateChan("Status", disobj);
    this.displays.push(disobj);
};

jIRCs.prototype.initChan = function(channel, disobj) {
    var tab = document.createElement('span');
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
    disobj.tabbar.appendChild(tab);
    disobj.tabs[channel] = tab;
    disobj.lines[channel] = [];
};

jIRCs.prototype.destroyChan = function(channel) {
    if (channel != 'Status' && channel in this.channels) {
        //part channel
        this.send("PART",[channel]);
        //Iterate through displays
        this.forEach(this.displays, function(disobj) {
            //remove from DOM
            disobj.tabbar.removeChild(disobj.tabs[channel]);
            //destroy
            delete(disobj.tabs[channel]);
            if(channel == disobj.viewing) {
                //pick a channel to activate
                var newchan = disobj.history.pop();
                while (newchan && !disobj.tabs[newchan]) {
                    newchan = disobj.history.pop() || false;
                }
                if(!newchan) {
                    newchan = 'Status';
                }
                this.activateChan(newchan, disobj);
            }
        }, this);
        delete(this.channels[channel]);
    }   
};

jIRCs.prototype.activateChan = function(channel, disobj) {
    if (disobj.tabs[channel] && disobj.viewing != channel) {
        this.forEach(this.displays, function(idisobj) {
            this.forEach(idisobj.tabs, function(tab, chan) {
                var newClass = 'jircs_tab';
                if(idisobj != disobj && tab.className.indexOf("jircs_tab_active") != -1) {
                    newClass += ' jircs_tab_active';
                }
                if(chan != channel) {
                    if(tab.className.indexOf("jircs_tab_attention") != -1) {
                        newClass += " jircs_tab_attention"
                    }
                    if(tab.className.indexOf("jircs_tab_hilight") != -1) {
                        newClass += " jircs_tab_hilight"
                    }
                }
                tab.className = newClass;  
            }, this);
        }, this);
        disobj.tabs[channel].className += " jircs_tab_active";
        disobj.history.push(disobj.viewing);
        disobj.viewing = channel;
        // Re-render (involves replacing all the messages)
        disobj.messages.innerHTML = "";
        this.forEach(disobj.lines[channel], function(line) {
            disobj.messages.appendChild(line.container);
        }, this);
        this.render(disobj);
    }
};

jIRCs.prototype.render = function(disobj) {
    // Re-generate topic
    disobj.topic.innerHTML = "";
    if(disobj.viewing in this.channels && this.channels[disobj.viewing].topic) {
        var tmsg = document.createElement('p');
        tmsg.appendChild(document.createTextNode(this.channels[disobj.viewing].topic.message));
        tmsg.className = 'jircs_topic_message';
        tmsg.innerHTML = this.formatLine(tmsg.innerHTML);
        disobj.topic.appendChild(tmsg);
        if(this.channels[disobj.viewing].topic.creator) {
            var tcreator = document.createElement('p');
            var msg = 'Set by ' + this.channels[disobj.viewing].topic.creator;
            if(this.channels[disobj.viewing].topic.time) { 
                var t = this.channels[disobj.viewing].topic.time;
                var h = '' + t.getHours();
                var m = '' + t.getMinutes();
                var s = '' + t.getSeconds();
                msg += ' on ' + (t.getMonth() + 1) + '/' + t.getDate() + '/' + t.getFullYear() + ' ' + (h.length > 1 ? h : '0'+h) + ':' + (m.length > 1 ? m : '0'+m) + ':' + (s.length > 1 ? s : '0'+s);
            }
            tcreator.appendChild(document.createTextNode(msg));
            tcreator.className = 'jircs_topic_creator';
            disobj.topic.appendChild(tcreator);
        }
    }
    // Re-generate userlist
    var ulistw = 0, ulisth = 0;
    if(disobj.viewing in this.channels) {
        disobj.userlist.innerHTML = "";
        var users = {};
        var prefix = '', rank = '';
        // Break users into ranks
        this.forEach(this.channels[disobj.viewing].names, function(prefix, u) {
            if(prefix.length) {
                prefix = prefix.charAt(0);
            }
            rank = prefix in this.statuses ? this.statuses[prefix] : '';
            if(!(rank in users)) {
                users[rank] = [];
            }
            users[rank].push(prefix + u);
        }, this);
        // Add users to DOM
        this.forEach(this.statusOrder, function(r) {
            if(!(r in users)) {
                return;
            }
            var ulist = users[r];
            // Case insensitive sort
            ulist.sort(function(a,b) { if(a.toLowerCase() > b.toLowerCase()) return 1; if(a.toLowerCase() < b.toLowerCase()) return -1; return 0;});
            console.log(ulist);
            this.forEach(ulist, function(u) {
                var p = document.createElement('p');
                p.appendChild(document.createTextNode(u));
                p.className = 'jircs_userlist_user';
                disobj.userlist.appendChild(p);
                var dim = this.measureText(u,'jircs_userlist_user');
                ulistw = Math.max(dim["width"], ulistw);
                ulisth += dim["height"];
            }, this);
        }, this);
    }
    // Re-generate input bar
    disobj.name.innerText = this.nickname+"\u00A0"; // \u00A0 = non-breaking space
    disobj.input.style.width = "0px";
    disobj.input.style.width = (disobj.inputbar.clientWidth - disobj.form.clientWidth) + "px";
    // Fix all the heights
    disobj.window.style.height = "0px";
    componentHeight = disobj.tabbar.clientHeight + disobj.topic.clientHeight + disobj.window.clientHeight + disobj.inputbar.clientHeight + disobj.status.clientHeight;
    disobj.window.style.height = (disobj.container.clientHeight - componentHeight) + "px";
    if(ulisth > disobj.window.clientHeight) {
        disobj.userlist.style.width = (ulistw + 20) + 'px';
    } else {
        disobj.userlist.style.width = ulistw + 'px';
    }
    disobj.userlist.style.height = disobj.window.clientHeight + "px";
    disobj.chat.style.width = (disobj.window.clientWidth - disobj.userlist.offsetWidth) + "px";
    disobj.messages.style.height = (disobj.window.clientHeight - disobj.notificiation.offsetHeight) + "px";
    // Ensure standardized width of messages
    var timew = 0, namew = 0, mesh = 0, mesw = 0;
    // Calculate message width
    this.forEach(disobj.lines[disobj.viewing], function(line) {
        var dim;
        dim = this.measureText(line.time.innerText, line.time.className);
        timew = Math.max(dim["width"], timew);
        dim = this.measureText(line.name.innerText, line.name.className);
        namew = Math.max(dim["width"], namew);
    }, this);
    // Assume we need scrollbars
    mesw = disobj.messages.clientWidth - timew - namew - 20 - this.measureText("","jircs_chatText jircs_action jircs_hilight")["width"];
    this.forEach(disobj.lines[disobj.viewing], function(line) {
        line.time.style.width = timew + "px";
        line.name.style.width = namew + "px";
        line.message.style.width = mesw + "px";
        mesh += line.container.clientHeight;
    }, this);
    // If it turns out we don't need scrollbars, fill in the extra space
    if(mesh < disobj.messages.clientHeight) {
        mesw = disobj.messages.clientWidth - timew - namew - this.measureText("","jircs_chatText jircs_action jircs_hilight")["width"];
        this.forEach(disobj.lines[disobj.viewing], function(line) {
            line.message.style.width = mesw + "px";
        }, this);
    }
};

jIRCs.prototype.renderLine = function(channel, speaker, message, disobj) {
    if (!channel) {
        channel = "Status";
    }
    var now = new Date();
    var h = '' + now.getHours();
    var m = '' + now.getMinutes();
    var s = '' + now.getSeconds();
    var date = document.createElement('div');
    var user = document.createElement('div');
    var text = document.createElement('div');
    date.className = "jircs_chatDate";
    user.className = "jircs_chatUser";
    text.className = "jircs_chatText";
    date.style.display = "inline-block";
    user.style.display = "inline-block";
    text.style.display = "inline-block";
    date.appendChild(document.createTextNode('[' + (h.length > 1 ? h : '0'+h) + ':' + (m.length > 1 ? m : '0'+m) + ':' + (s.length > 1 ? s : '0'+s) + ']'));
    user.appendChild(document.createTextNode("\u00A0"+speaker+"\u00A0")); // \u00A0 = non-breaking space
    text.appendChild(document.createTextNode(message));
    if(speaker == '') {
        text.className += " jircs_action";
    }
    var nickCheck = new RegExp("\\b"+this.nickname+"\\b");
    text.innerHTML = this.formatLine(text.innerHTML);
    if(!(channel in this.channels)) {
        this.channels[channel] = {} // Add a new object in which we can store channel data
    }
    // Track open channels
    var open = [];
    this.forEach(this.displays, function(d) {
        open.push(d.viewing);
    }, this);
    var displays = this.displays;
    if(disobj) {
        displays = [disobj];
    }
    this.forEach(displays, function(disobj) {
        // Initialize the channel if we haven't seen it before
        if (!disobj.tabs[channel]) {
            this.initChan(channel, disobj);
        }
        // Do we need to scroll?
        var b = (disobj.messages.scrollHeight < disobj.messages.clientHeight || disobj.messages.scrollHeight <= disobj.messages.scrollTop + disobj.messages.clientHeight + 50); // 50px buffer just in case
        // Clone the row
        var r = document.createElement('div');
        var d = date.cloneNode(true);
        var u = user.cloneNode(true);
        var t = text.cloneNode(true);
        r.className = "jircs_chatRow";
        if(nickCheck.test(message)) { // Hilight
            r.className += " jircs_hilight";
        }
        r.appendChild(d); r.appendChild(u); r.appendChild(t);
        // Add to the buffer
        disobj.lines[channel].push({
            "container": r,
            "time": d,
            "name": u,
            "message": t,
        });
        while(disobj.lines[channel].length > this.scrollbackSize) {
            disobj.lines[channel].shift();
        }
        if(disobj.viewing == channel) {
            disobj.messages.appendChild(r);
            while(disobj.messages.children.length > this.scrollbackSize) {
                disobj.messages.removeChild(disobj.messages.firstChild);
            }
            this.render(disobj); // Brute-force dimensions into submission
        }
        if(b) {
            disobj.messages.scrollTop = disobj.messages.scrollHeight - disobj.messages.clientHeight; // Only scroll when user is at the bottom
        }
        if (open.indexOf(channel) == -1) {
            if(disobj.tabs[channel].className.indexOf("jircs_tab_attention") == -1) {
                disobj.tabs[channel].className += " jircs_tab_attention";
            }
            if(disobj.tabs[channel].className.indexOf("jircs_tab_hilight") == -1 && nickCheck.test(message)) {
                disobj.tabs[channel].className += " jircs_tab_hilight";
            }
        }
    }, this);
};

jIRCs.prototype.formatLine = function(line) {
    return line;
};
