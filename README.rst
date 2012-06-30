==============
jIRCs
==============

A lightweight javascript IRC client.

Usage
=====

Include jircs.js, and pass a websocket-like object to the constructor

    >>> <script src="jircs.js"></script>
    >>> <script>
    >>>     var irc = new jIRCs(new WebSocket("ws://23.21.47.44:8000"));
    >>>     irc.nick('jIRCs-test');
    >>> </script>

License
=======

jIRCs is (c) 2012 Christopher Gamble and is made available under the BSD license.