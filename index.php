<?php
$password = "";

session_start();
if($_SESSION['user']) {
    mysql_connect("dbtest.fugiman.com","txircd","XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    mysql_select_db("txircd");
    $result = mysql_fetch_assoc(mysql_query(sprintf("SELECT token FROM irc_tokens WHERE donor_id = %d AND ip = '%s'", $_SESSION['user'], mysql_real_escape_string($_SERVER['REMOTE_ADDR']))));
    if($result) {
        $password = $result["token"];
    } else {
        $password = hash("sha256",uniqid($_SERVER['REMOTE_ADDR'],true));
        mysql_query(sprintf("INSERT INTO irc_tokens(token,donor_id,ip) VALUES('%s',%d,'%s')", $password, $_SESSION['user'], mysql_real_escape_string($_SERVER['REMOTE_ADDR'])));
    }
}
?>
<!doctype html>
<html>
    <head>
        <title>jIRCs Test</title>
        <link rel="stylesheet" type="text/css" href="jircs.css" />
        <script src="http://cdn.sockjs.org/sockjs-0.3.min.js"></script>
        <script src="jircs.js"></script>
        <script src="utils.js"></script>
        <script src="gui2.js"></script>
        <script src="irc_commands.js"></script>
        <script src="user_commands.js"></script>
        <script src="ctcp_commands.js"></script>
        <script>
            function login() {
                irc = new jIRCs(new SockJS("http://dbtest.fugiman.com:8080/"));
                irc.nick(document.getElementById("jircs-login").value,"<?php echo $password; ?>");
                document.getElementById("jircs").innerHTML = "";
                irc.display(document.getElementById("jircs"));
                
                window.onbeforeunload = function(e) {
                    var message = "Are you sure you want to leave?";
                    e = e || window.event;
                    if (e) {
                        e.returnValue = message;
                    }
                    return message;
                };
                
                return false;
            }
            
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
                document.getElementById("jircs").style.height = (h - 16) + "px";
                if("irc" in window) {
                    irc.forEach(irc.displays, irc.render, irc);
                }
            };
        </script>
    </head>
    <body> 
        <div id="jircs">
            <div style="background: #999; position: relative; height: 100%">
                <div style="position: absolute; top: 50%; left: 50%; margin-top: -50px; height: 100px; width: 200px; margin-left: -100px; text-align: center;">
                    <h2 style="margin: 0">Choose Yo Nick</h2>
                    <form onsubmit="return login()">
                        <input type="text" id="jircs-login" style="width: 180px"><br>
                        <input type="submit" value="Join Chat"><br>
                    </form>
                    <?php if(!$_SESSION['user']) echo '<a href="/login.php">Login</a> | <a href="/register.php">Register</a>'; ?>
                </div>
            </div>
            <script>window.onresize();</script>
        </div>
    </body>
</html>
