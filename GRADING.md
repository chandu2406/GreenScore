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
  databases             We use several different SQL databases that we set up on
                        our server to both keep track of user accounts and
                        environmental survey data.
  additional tech       We use coffeescript and scss to enhance the quality of
                        our codebase, especially on the server side.

2. Robust App [15 pts]
  Our app is functional. We do form validation for, and sanitize, user input,
  and make sure that users are logged in before they can log in to the profile
  page. We also do not allow users to make any unwarranted SQL queries.

3. User Experience (UX) [15 pts]
  Our goal is to make the app as simple to use as possible, and to make the UI
  as clean as pssible. We used jQuery mobile to help the first point. For the
  latter, we have the facebook login option to create a familiar and fast login
  experience. We keep our headers consistent for easy navigation, and we keep
  map controls (such as the filter) separate form the navigation to avoid
  unneccessary clutter.

4. Design Process, User Testing, and Iterative Design [10 pts]
  // TODO(ken)

5. Effort [10 pts]

6. Code Design / Style [5 pts]
  We used an MVC frameowrk in app/ to clearly separate our code. We also used a
  doxygen-esque commenting framework to document our code.

7. Presentation [5 pts]
  Next Friday!

