Members:
- Ken Murphy  (kmmurphy)
- Lucas Ray   (ltray)
- Nick LaGrow (nlagrow)

1. Required Elements [40 pts; 4 pts each]
  Javascript            We use javascript for all of the front end scripts.
                        This can be found in app/scripts.
  HTML                  Most of the HTML is pretty brief - we do use forms and
                        JQuery Mobile HTML styling. Most of this is in
                        app/index.html
  CSS                   This is in app/css. We used SCSS, so our design is
                        better seen through the .scss files.
  DOM Manipulation      We use JQuery and JQuery mobile pretty heavily. This is
                        all present in app/scripts/controllers.
  jQuery                As said before, we use jQuery on both the server and the
                        client side. Look at all of the .coffee/.js files in the
                        root directory as well as everything in app/scripts.
  jQuery Mobile         We use jQueryMobile. This is most clearly seen in
                        app/index.html, but it is present in all of our code and
                        design decisions. Some of the server side scripts use
                        workarounds to make sure the app works with the jQuery
                        Mobile method of loading and changing pages (see
                        http_request_server.coffee)
  node.js               We use node.js extensively - this includes Node,
                        Express, Passport, Passport-facebook, and multiple other
                        node packages. This is mostly seen in the server-side
                        code in http_request_server.coffee and
                        socket_server.coffee.
  websockets            See socket_server.coffee - we use Socket.io to do socket
                        requests, especially when searching. On the client side,
                        this is present in app/scripts/controllers

