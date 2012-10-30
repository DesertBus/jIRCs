jIRCs.prototype.display = function(container) {
    if (!container) {
        var scripts = document.getElementsByTagName('script');
        container = scripts[scripts.length - 1].parentNode;
    }
    
    // Create the DOM
    var tabbar = document.createElement('div');
    var topic = document.createElement('div');
    var auction = document.createElement('div');
    var window = document.createElement('div');
    var chat = document.createElement('div');
    var messages = document.createElement('div');
    var notification = document.createElement('div');
    var userlist = document.createElement('div');
    var inputbar = document.createElement('div');
    var status = document.createElement('div');
    var form = document.createElement('form');
    var name = document.createElement('label');
    var input = document.createElement('input');
    var send = document.createElement('input');
    var status_normal = document.createElement("div");
    var status_connected = document.createElement("span");
    var status_account = document.createElement("span");
    var status_special = document.createElement("div");
    var status_gethelp = document.createElement("a");
    var status_hideulist = document.createElement("a");
    var status_hideauction = document.createElement("a");
    var auction_image = document.createElement("img");
    var auction_title = document.createElement("span");
    var auction_bidder = document.createElement("span");
    var auction_bid = document.createElement("span");
    var auction_form = document.createElement("form");
    var auction_input = document.createElement("input");
    var auction_submit = document.createElement("input");
    
    // Save the display object
    var disobj = {
        // DOM
        'container': container,
        'tabbar': tabbar,
        'topic': topic,
        'auction': auction,
        'window': window,
        'chat': chat,
        'messages': messages,
        'notification': notification,
        'userlist': userlist,
        'inputbar': inputbar,
        'status': status,
        'form': form,
        'name': name,
        'input': input,
        'send': send,
        'status_normal': status_normal,
        'status_connected': status_connected,
        'status_account': status_account,
        'status_special': status_special,
        'status_gethelp': status_gethelp,
        'status_hideulist': status_hideulist,
        'status_hideauction': status_hideauction,
        'auction_image': auction_image,
        'auction_title': auction_title,
        'auction_bidder': auction_bidder,
        'auction_bid': auction_bid,
        'auction_form': auction_form,
        'auction_input': auction_input,
        'auction_submit': auction_submit,
        // Vars
        'viewing': '',
        'tabs': {},
        'lines': {},
        'widths': {},
        'history': [],
        'options': {
            'show_userlist': true,
            'show_auction': true
        },
        'auction_running': false,
        'note_timer': false
    };
    
    // Set all them fancy classes
    container.className = "jircs_main";
    tabbar.className = "jircs_tabbar";
    topic.className = "jircs_topic";
    auction.className = "jircs_auction";
    window.className = "jircs_window";
    chat.className = "jircs_chat";
    messages.className = "jircs_messages";
    notification.className = "jircs_notification";
    userlist.className = "jircs_userlist";
    inputbar.className = "jircs_inputbar";
    status.className = "jircs_status";
    form.className = "jircs_form";
    name.className = "jircs_name";
    input.className = "jircs_input";
    send.className = "jircs_send";
    status_normal.className = "jircs_status_normal";
    status_connected.className = "jircs_status_connected";
    status_account.className = "jircs_status_account";
    status_special.className = "jircs_status_special";
    status_gethelp.className = "jircs_status_gethelp";
    status_hideulist.className = "jircs_status_hideulist";
    status_hideauction.className = "jircs_status_hideauction";
    auction_image.className = "jircs_auction_image";
    auction_title.className = "jircs_auction_title";
    auction_bidder.className = "jircs_auction_bidder";
    auction_bid.className = "jircs_auction_bid";
    auction_form.className = "jircs_auction_form";
    auction_input.className = "jircs_auction_input";
    auction_submit.className = "jircs_auction_submit";
    
    // Set values and styles
    container.style.overflow = "hidden";
    chat.style.display = "inline-block";
    userlist.style.display = "inline-block";
    form.style.display = "inline-block";
    input.style.display = "inline-block";
    messages.style.verticalAlign = "top";
    messages.style.overflow = "auto";
    userlist.style.verticalAlign = "top";
    userlist.style.overflow = "auto";
    input.type = 'text';
    send.type = "submit";
    send.value = "Send";
    status_normal.style.display = "inline-block";
    status_normal.style.width = "60%";
    status_connected.innerHTML = this.connected ? "Connected" : "Disconnected";
    status_account.appendChild(document.createTextNode(this.account ? "Logged in as "+this.account : "Not Logged In"));
    status_special.style.display = "inline-block";
    status_special.style.width = "39%";
    status_special.style.textAlign = "right";
    status_gethelp.href = "#";
    status_hideulist.href = "#";
    status_hideauction.href = "#";
    status_gethelp.innerHTML = "Get Help";
    status_hideulist.innerHTML = disobj.options.show_userlist ? "Hide Userlist" : "Show Userlist";
    status_hideauction.innerHTML = disobj.options.show_auction ? "Hide Auction Banner" : "Show Auction Banner";
    auction.style.display = "none";
    auction_input.type = "text";
    auction_submit.type = "submit";
    auction_submit.value = "Bid";
    
    // Attach all those elements together
    container.appendChild(tabbar);
    container.appendChild(topic);
    container.appendChild(auction);
    container.appendChild(window);
    container.appendChild(inputbar);
    container.appendChild(status);
    window.appendChild(chat);
    window.appendChild(userlist);
    chat.appendChild(messages);
    chat.appendChild(notification);
    inputbar.appendChild(form);
    form.appendChild(name);
    form.appendChild(input);
    form.appendChild(send);
    status_normal.appendChild(status_connected);
    status_normal.appendChild(document.createTextNode(" | "));
    status_normal.appendChild(status_account);
    status_special.appendChild(status_gethelp);
    status_special.appendChild(document.createTextNode(" | "));
    status_special.appendChild(status_hideulist);
    status_special.appendChild(document.createTextNode(" | "));
    status_special.appendChild(status_hideauction);
    status.appendChild(status_normal);
    status.appendChild(status_special);
    auction.appendChild(auction_image);
    auction.appendChild(auction_title);
    auction.appendChild(auction_bidder);
    auction.appendChild(auction_bid);
    auction.appendChild(auction_form);
    auction_form.appendChild(auction_input);
    auction_form.appendChild(auction_submit);
    
    // Add event listeners
    this.listen(container, "click", this.el_container_click, disobj);
    this.listen(container, "mousedown", this.el_container_mousedown, disobj);
    this.listen(container, "mouseup", this.el_container_mouseup, disobj);
    this.listen(auction, "mouseup", this.el_auction_mouseup, disobj);
    this.listen(form, "submit", this.el_form_submit, disobj);
    this.listen(input, "keydown", this.el_input_keydown, disobj);
    this.listen(status_gethelp, "click", this.el_gethelp_click, disobj);
    this.listen(status_hideulist, "click", this.el_hideulist_click, disobj);
    this.listen(status_hideauction, "click", this.el_hideauction_click, disobj);
    this.listen(auction_form, "submit", this.el_auction_form_submit, disobj);
    
    //set up Status window
    this.initChan("Status", disobj);
    this.activateChan("Status", disobj);
    this.displays.push(disobj);
};

jIRCs.prototype.initChan = function(channel, disobj) {
    var tab = document.createElement('span');
    tab.className = "jircs_tab";
    tab.style.position = "relative";
    tab.style.overflow = "hidden";
    tab.style.cursor = "pointer";
    tab.appendChild(document.createTextNode(channel));
    this.listen(tab, "click", this.el_tab_click, disobj);
    if (channel != "Status") {
        var closeBtn = document.createElement("span");
        closeBtn.appendChild(document.createTextNode("X"));
        this.listen(closeBtn, "click", this.el_closebtn_click, disobj);
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
        if(channel.charAt(0) == "#")
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
        // Scroll to the bottom
        disobj.messages.scrollTop = disobj.messages.scrollHeight - disobj.messages.clientHeight;
    }
};

jIRCs.prototype.render = function(disobj) {
    // How much do we skew our measurements by?
    var fudgeFactor = 4; //px
    // Re-generate topic
    disobj.topic.innerHTML = "";
    if(disobj.viewing in this.channels && this.channels[disobj.viewing].topic) {
        var tmsg = document.createElement('p');
        tmsg.style.margin = "0";
        tmsg.appendChild(document.createTextNode(this.channels[disobj.viewing].topic.message));
        tmsg.className = 'jircs_topic_message';
        tmsg.innerHTML = this.formatLine(tmsg.innerHTML);
        disobj.topic.appendChild(tmsg);
        if(this.channels[disobj.viewing].topic.creator) {
            var tcreator = document.createElement('p');
            tcreator.style.margin = "0";
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
    // Re-generate auction
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
            this.forEach(ulist, function(u) {
                var p = document.createElement('p');
                p.style.margin = "0";
                p.style.cursor = "pointer";
                this.listen(p, "click", this.el_userentry_click, disobj);
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
    disobj.name.innerHTML = "";
    disobj.name.appendChild(document.createTextNode(this.nickname+"\u00A0")); // \u00A0 = non-breaking space
    disobj.input.style.width = "0px";
    disobj.input.style.width = (disobj.inputbar.clientWidth - disobj.form.offsetWidth - fudgeFactor) + "px";
    // Fix all the heights
    disobj.window.style.height = "0px";
    componentHeight = disobj.tabbar.offsetHeight + disobj.topic.offsetHeight + disobj.auction.offsetHeight + disobj.window.offsetHeight + disobj.inputbar.offsetHeight + disobj.status.offsetHeight;
    disobj.window.style.height = (disobj.container.clientHeight - componentHeight) + "px";
    if(ulisth > disobj.window.clientHeight) {
        disobj.userlist.style.width = (ulistw + fudgeFactor + this.calculateScrollWidth()) + 'px';
    } else {
        disobj.userlist.style.width = (ulistw + fudgeFactor) + 'px';
    }
    disobj.userlist.style.height = disobj.window.clientHeight + "px";
    disobj.chat.style.width = (disobj.window.clientWidth - disobj.userlist.offsetWidth - fudgeFactor) + "px";
    disobj.messages.style.height = (disobj.window.clientHeight - disobj.notification.offsetHeight) + "px";
    // Ensure standardized width of messages
    var timew = 0, namew = 0, mesh = 0, mesw = 0;
    // Calculate message width
    this.forEach(disobj.lines[disobj.viewing], function(line) {
        var dim;
        dim = this.measureText(line.time.textContent || line.time.innerText, line.time.className);
        timew = Math.max(dim["width"], timew);
        dim = this.measureText(line.name.textContent || line.name.innerText, line.name.className);
        namew = Math.max(dim["width"], namew);
    }, this);
    // Assume we need scrollbars
    mesw = disobj.messages.clientWidth - timew - namew - fudgeFactor - this.calculateScrollWidth() - this.measureText("","jircs_chatText jircs_action jircs_hilight")["width"];
    this.forEach(disobj.lines[disobj.viewing], function(line) {
        line.time.style.width = timew + "px";
        line.name.style.width = namew + "px";
        line.message.style.width = mesw + "px";
        mesh += line.container.offsetHeight;
    }, this);
    // If it turns out we don't need scrollbars, fill in the extra space
    if(mesh + fudgeFactor < disobj.messages.clientHeight) {
        mesw = disobj.messages.clientWidth - timew - namew - fudgeFactor - this.measureText("","jircs_chatText jircs_action jircs_hilight")["width"];
        this.forEach(disobj.lines[disobj.viewing], function(line) {
            line.message.style.width = mesw + "px";
        }, this);
    }
    if(!(disobj.viewing in disobj.widths)) {
        disobj.widths[disobj.viewing] = {};
    }
    disobj.widths[disobj.viewing].time = timew;
    disobj.widths[disobj.viewing].name = namew;
    disobj.widths[disobj.viewing].message = mesw;
    disobj.widths[disobj.viewing].height = mesh + fudgeFactor;
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
    text.style.wordWrap = "break-word";
    if(speaker == '') {
        text.className += " jircs_action";
    }
    if(speaker == channel) {
        speaker = '';
        text.className += " jircs_event";
    }
    date.appendChild(document.createTextNode('[' + (h.length > 1 ? h : '0'+h) + ':' + (m.length > 1 ? m : '0'+m) + ':' + (s.length > 1 ? s : '0'+s) + ']'));
    user.appendChild(document.createTextNode("\u00A0"+speaker+"\u00A0")); // \u00A0 = non-breaking space
    text.appendChild(document.createTextNode(message));
    var nickCheck = new RegExp("\\b" + this.cleanRegex(this.nickname) + "\\b");
    text.innerHTML = this.formatLine(text.innerHTML);
    var widths = {
        "time": this.measureText(date.textContent || date.innerText, date.className).width,
        "name": this.measureText(user.textContent || user.innerText, user.className).width,
        "message": this.measureText(text.textContent || text.innerText, text.className).width
    };
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
        if(!(disobj.viewing in disobj.widths)) {
            disobj.widths[disobj.viewing] = {};
        }
        // Do we need to scroll?
        var b = (disobj.messages.scrollHeight < disobj.messages.clientHeight || disobj.messages.scrollHeight <= disobj.messages.scrollTop + disobj.messages.clientHeight + 50); // 50px buffer just in case
        // Clone the row
        var r = document.createElement('div');
        var d = date.cloneNode(true);
        var u = user.cloneNode(true);
        var t = text.cloneNode(true);
        d.style.width = disobj.widths[disobj.viewing].time + "px";
        u.style.width = disobj.widths[disobj.viewing].name + "px";
        t.style.width = disobj.widths[disobj.viewing].message + "px";
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
            "message": t
        });
        while(disobj.lines[channel].length > this.scrollbackSize) {
            disobj.lines[channel].shift();
        }
        if(disobj.viewing == channel) {
            disobj.messages.appendChild(r);
            while(disobj.messages.children.length > this.scrollbackSize) {
                disobj.messages.removeChild(disobj.messages.firstChild);
            }
            if(
                widths.time > disobj.widths[disobj.viewing].time ||
                widths.name > disobj.widths[disobj.viewing].name ||
                widths.message > disobj.widths[disobj.viewing].message ||
                (
                    disobj.widths[disobj.viewing].height - r.offsetHeight < disobj.messages.clientHeight &&
                    disobj.widths[disobj.viewing].height + r.offsetHeight >= disobj.messages.clientHeight
                )
            ) {
                this.render(disobj); // Brute-force dimensions into submission
            }
        }
        disobj.widths[disobj.viewing].height += r.offsetHeight; // Gotta keep it real
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

// This function is a disaster and should be fixed whenever possible
jIRCs.prototype.formatLine = function(line) {
    line = line.replace(this.url_regex, this.linkMunger); // Auto-linkify links
    line = line.replace(/([>\s])(#[^\s\a,:]+?)([<\s])/ig,'$1<a href="$2" class="jircs_channel_link">$2</a>$3'); // Auto-linkify channels
    
    var depth = 0;
    var l = '';
    var bold = false;
    var italic = false;
    var underline = false;
    var color = { foreground: false, background: false, tmp: '', state: 0, set: false };
    this.forEach(line, function(c) {
        var rebuild = false;
        var defer = false;
        if(c == '\u0002') { // Bold
            if(bold) {
                rebuild = true;
            } else {
                l += '<span class="jircs_bold">';
                depth += 1;
            }
            bold = !bold;
        } else if(c == '\u0016') { // Reverse
            if (!color.foreground) {
                color.foreground = '1'; // The default foreground color is 1
            }
            if (!color.background) {
                color.background = '0'; // The default background color is 0
            }
            var swap = color.foreground;
            color.foreground = color.background;
            color.background = swap;
            if(color.set) {
                l += '<span>';
                depth += 1;
            } else {
                l += '<span><span>';
                depth += 2;
            }
            color.set = rebuild = true;
        } else if(c == '\u001D') { // Italic
            if(italic) {
                rebuild = true;
            } else {
                l += '<span class="jircs_italic">';
                depth += 1;
            }
            italic = !italic;
        } else if(c == '\u001F') { // Underline
            if(underline) {
                rebuild = true;
            } else {
                l += '<span class="jircs_underline">';
                depth += 1;
            }
            underline = !underline;
        } else if(c == '\u0003') { // Color
            color.state = 1;
        } else if(color.state == 1) {
            if(isNaN(parseInt(c))) {
                color.state = 0
                color.foreground = color.background = color.set = false;
                defer = rebuild = true;
            } else {
                color.tmp += c;
                color.state = 2;
            }
        } else if(color.state == 2) {
            if(isNaN(parseInt(c))) {
                color.foreground = color.tmp;
                color.tmp = '';
                if(c == ',') {
                    color.state = 3;
                } else {
                    color.state = 0;
                    defer = true;
                    depth += 1;
                    if(color.set) {
                        // Rebuild colors hack
                        l += '<span>';
                        rebuild = true;
                    } else {
                        color.set = true;
                        l += '<span class="jircs_color_foreground_' + parseInt(color.foreground) + '">';
                    }
                }
            } else {
                color.tmp += c;
            }
        } else if(color.state == 3) {
            if(isNaN(parseInt(c))) {
                if(color.tmp) {
                    color.background = color.tmp;
                }
                color.tmp = '';
                color.state = 0;
                defer = true;
                depth += 1;
                if(color.set) {
                    // Rebuild colors hack
                    l += '<span>';
                    rebuild = true;
                } else {
                    color.set = true;
                    l += '<span class="jircs_color_foreground_' + parseInt(color.foreground) + ' jircs_color_background_' + parseInt(color.background) + '">';
                }
            } else {
                color.tmp += c;
            }
        } else if(c == '\u000F') {
            l += this.repeat('</span>', depth);
            depth = 0;
            bold = italic = underline = color.foreground = color.background = color.set = false;
        } else {
            l += c;
        }
        if(rebuild) {
            l += this.repeat('</span>', depth);
            depth -= 1;
            if(bold) {
                l += '<span class="jircs_bold">';
            }
            if(italic) {
                l += '<span class="jircs_italic">';
            }
            if(underline) {
                l += '<span class="jircs_underline">';
            }
            if(color.foreground) {
                l += '<span class="jircs_color_foreground_' + parseInt(color.foreground);
                if(color.background) {
                    l += ' jircs_color_background_' + parseInt(color.background);
                }
                l += '">';
            }
        }
        if(defer) {
            l += c;
        }
    }, this);
    l += this.repeat('</span>', depth);
    return l;
};

jIRCs.prototype.renderNotification = function(message, disobj) {
    if(disobj.note_timer) {
        clearTimeout(disobj.note_timer);
    }
    disobj.notification.innerHTML = "";
    disobj.notification.appendChild(document.createTextNode(message));
    this.render(disobj);
    disobj.note_timer = setTimeout(this.clearNotifications.bind(this, disobj), 5000);
};

jIRCs.prototype.clearNotifications = function(disobj){
        disobj.notification.innerHTML = "";
        this.render(disobj);
        disobj.note_timer = false;
};

jIRCs.prototype.setConnected = function(connected) {
    this.connected = connected;
    this.forEach(this.displays, function(disobj) {
        disobj.status_connected.innerHTML = connected ? "Connected" : "Disconnected";
        this.render(disobj);
    }, this);
};

jIRCs.prototype.setAccount = function(account) {
    this.account = account;
    this.forEach(this.displays, function(disobj) {
        disobj.status_account.innerHTML = "";
        disobj.status_account.appendChild(document.createTextNode(account ? "Logged in as "+account : "Not Logged In"));
        this.render(disobj);
    }, this);
};

jIRCs.prototype.auctionStart = function(id, name) {
    this.forEach(this.displays, function(disobj) {
        disobj.auction_running = true;
        if(disobj.options.show_auction) {
            disobj.auction.style.display = "block";
        }
        disobj.auction_image.src = "http://desertbus.org/thumbs/irc/"+id+".png";
        disobj.auction_title.innerHTML = "";
        disobj.auction_title.appendChild(document.createTextNode(name));
        this.render(disobj);
    }, this);
};

jIRCs.prototype.auctionBid = function(bid, bidder) {
    this.forEach(this.displays, function(disobj) {
        disobj.auction_bid.innerHTML = "";
        disobj.auction_bidder.innerHTML = "";
        disobj.auction_bid.appendChild(document.createTextNode(bid));
        disobj.auction_bidder.appendChild(document.createTextNode(bidder));
        this.render(disobj);
    }, this);
};

jIRCs.prototype.auctionStop = function() {
    this.forEach(this.displays, function(disobj) {
        disobj.auction_running = false;
        disobj.auction.style.display = "none";
        this.render(disobj);
    }, this);
};

// Event Listeners
jIRCs.prototype.el_container_click = function(disobj, e) {
    if(e.target && e.target.className == 'jircs_channel_link') {
        this.send('JOIN',[e.target.innerHTML]);
        this.cancelEvent(e);
    }
};

jIRCs.prototype.el_container_mousedown = function(disobj, e) {
    disobj.mouse = {'x':e.screenX,'y':e.screenY};
};

jIRCs.prototype.el_container_mouseup = function(disobj, e) {
    if(!('mouse' in disobj && 'x' in disobj.mouse && 'y' in disobj.mouse)) {
        disobj.input.focus();
    }
    var dx = disobj.mouse.x - e.screenX, dy = disobj.mouse.y - e.screenY;
    if(dx < 0) {
        dx *= -1;
    }
    if(dy < 0) {
        dy *= -1;
    }
    if(dx < 5 && dy < 5 && e.button == 0) { //Make sure text selection works as expected 
        disobj.input.focus();
    }
};

jIRCs.prototype.el_auction_mouseup = function(disobj, e) {
    if(!('mouse' in disobj && 'x' in disobj.mouse && 'y' in disobj.mouse)) {
        disobj.auction_input.focus();
        this.cancelEvent(e);
    }
    var dx = disobj.mouse.x - e.screenX, dy = disobj.mouse.y - e.screenY;
    if(dx < 0) {
        dx *= -1;
    }
    if(dy < 0) {
        dy *= -1;
    }
    if(dx < 5 && dy < 5 && e.button == 0) { //Make sure text selection works as expected 
        disobj.auction_input.focus();
        this.cancelEvent(e);
    }
};

jIRCs.prototype.el_form_submit = function(disobj, e) {
    this.cancelEvent(e);
    if(!disobj.input.value)
        return;
    this.handleLine(disobj.input.value, disobj);
    disobj.input.value = '';
};

jIRCs.prototype.el_input_keydown = function(disobj, e) {
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
        this.forEach(this.channels[disobj.viewing].names, function(status, n) {
            if(n.substring(0,name.length).toLowerCase() == name.toLowerCase()) {
                possible.push(n);
            }
        }, this);
        if(possible.length == 1) {
            name = possible[0];
        } else if(possible.length == 0) {
            this.renderNotification('No Possible Nicknames', disobj);
        } else {
            this.renderNotification('Possible Nicknames: '+possible.join(' '), disobj);
        }
        e.target.value = e.target.value.substring(0,begin) + name + e.target.value.substr(end);
        this.cancelEvent(e);
    }
};

jIRCs.prototype.el_tab_click = function(disobj, e) {
    this.activateChan(e.target.firstChild.nodeValue, disobj);
};

jIRCs.prototype.el_closebtn_click = function(disobj, e) {
    this.destroyChan(e.target.parentNode.firstChild.nodeValue);
};

jIRCs.prototype.el_hideulist_click = function(disobj, e) {
    this.cancelEvent(e);
    disobj.options.show_userlist = !disobj.options.show_userlist;
    disobj.userlist.style.display = disobj.options.show_userlist ? "inline-block" : "none";
    disobj.status_hideulist.innerHTML = disobj.options.show_userlist ? "Hide Userlist" : "Show Userlist";
    this.render(disobj);
};

jIRCs.prototype.el_gethelp_click = function(disobj, e) {
    this.cancelEvent(e);
    this.send("JOIN",["#help"]);
};

jIRCs.prototype.el_hideauction_click = function(disobj, e) {
    this.cancelEvent(e);
    disobj.options.show_auction = !disobj.options.show_auction;
    disobj.auction.style.display = disobj.options.show_auction && disobj.auction_running ? "block" : "none";
    disobj.status_hideauction.innerHTML = disobj.options.show_auction ? "Hide Auction Banner" : "Show Auction Banner";
    self.render(disobj);
};

jIRCs.prototype.el_auction_form_submit = function(disobj, e) {
    this.cancelEvent(e);
    if(!disobj.auction_input.value)
        return;
    this.command_BID(disobj.auction_input.value.split(" "), disobj);
    disobj.auction_input.value = '';
};

jIRCs.prototype.el_userentry_click = function(disobj, e) {
    var nick = e.target.firstChild.nodeValue.toLowerCase();
    if(nick.charAt(0) in this.statusSymbols)
        nick = nick.substr(1);
    if(!(nick in this.channels)) {
        this.channels[nick] = {} // Add a new object in which we can store channel data
    }
    this.initChan(nick, disobj);
    this.activateChan(nick, disobj);
};
