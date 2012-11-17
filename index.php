<!doctype html>
<html>
<meta charset="utf-8" />
    <head>
        <title>jIRCs Test</title>
        <link rel="stylesheet" type="text/css" href="jircs.css" />
        <script src="http://cdn.sockjs.org/sockjs-0.3.min.js"></script>
        <script src="jircs.min.js"></script>
        <style>html, body, #jircs { height: 100%; width: 100%; margin: 0; }</style>
    </head>
    <body> 
        <div id="jircs">
            <div style="background: #F66; position: relative; height: 100%">
                <div style="position: absolute; top: 50%; left: 50%; margin-top: -50px; height: 100px; width: 200px; margin-left: -100px; text-align: center;">
                    <h2 style="margin: 0">Javascript Disabled???</h2>
                    <p>Seems like somebody disabled javascript. That's just not going to work. If you want to chat, turn javascript back on, and then we can all have a good time. Ok?</p>
                </div>
            </div>
        </div>
        <script>
            (function(target) {
                target.innerHTML = "";
                
                var wrapper = document.createElement("div");
                var centered = document.createElement("div");
                var header = document.createElement("h2");
                var form = document.createElement("form");
                var input = document.createElement("input");
                var submit = document.createElement("input");
                
                wrapper.style.background = "#999";
                wrapper.style.position = "relative";
                wrapper.style.height = "100%";
                centered.style.position = "absolute";
                centered.style.top = "50%";
                centered.style.left = "50%";
                centered.style.height = "100px";
                centered.style.width = "200px";
                centered.style.marginTop = "-50px";
                centered.style.marginLeft = "-100px";
                centered.style.textAlign = "center";
                header.innerHTML = "Choose Yo Nick";
                header.style.margin = "0";
                input.type = "text";
                input.style.width = "180px";
                input.value = allCookies.getItem("jirc-nickname");
                submit.type = "submit";
                submit.value = "Join Chat";
                
                form.onsubmit = function() {
                    var irc = new jIRCs(function(){return new SockJS("https://irc.desertbus.org/");});
                    irc.nick(input.value,"");
                    target.innerHTML = "";
                    irc.display(target);
                    
                    return false;
                }
                
                target.appendChild(wrapper);
                wrapper.appendChild(centered);
                centered.appendChild(header);
                centered.appendChild(form);
                form.appendChild(input);
                form.appendChild(submit);
            
                window.onresize = function() {
                    var h = 460;
                    if (document.body && document.body.offsetHeight) {
                        h = document.body.offsetHeight;
                    }
                    if (document.compatMode=='CSS1Compat' && document.documentElement && document.documentElement.offsetHeight) {
                        h = document.documentElement.offsetHeight;
                    }
                    if (window.innerHeight) {
                        h = window.innerHeight;
                    }
                    target.style.height = (h - 16) + "px";
                    if("irc" in window) {
                        irc.forEach(irc.displays, irc.render, irc);
                    }
                };
                window.onresize();
            
            })(document.getElementById("jircs"))
        </script>
    </body>
</html>
