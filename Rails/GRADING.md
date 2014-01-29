Members:
- Ken Murphy  (kmmurphy)
- Lucas Ray   (ltray)
- Nick LaGrow (nlagrow)

1. Required Elements [40 pts; 4 pts each]
  Javascript            We use javascript for all of the front end scripts.
                        This can be found in app/scripts.
  HTML                  Most of the HTML is pretty brief - we do use forms and
                        JQuery Mobile HTML styling. All of this is contained within
                        app/index.html
  CSS                   This is in app/css. We used SCSS, so our design is
                        better seen through the .scss files.
  DOM Manipulation      We use JQuery and JQuery mobile pretty heavily. This is
                        all present in app/scripts/controllers.  XML responses from the         
                        Zillow API is converted to a jQuery element that is transversed and
                        manipulated similarly to the DOM.
  jQuery                As said before, we use jQuery on both the server and the
                        client side.  The scripts are contained in all the .coffee/.js files in the
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
  additional tech       We use coffeescript and sass to enhance the quality of
                        our codebase, especially on the server side.

2. Robust App [15 pts]
  Our app is functional. We do form validation for, and sanitize, user input,
  and make sure that users are logged in before they can log in to the profile
  page. We also do not allow users to make any unwarranted SQL queries. Nothing breaks.

3. User Experience (UX) [15 pts]
  Our goal is to make the app as simple to use as possible, and to make the UI
  as clean as pssible. We used jQuery mobile to help the first point. For the
  latter, we have the facebook login option to create a familiar and fast login
  experience. We keep our headers consistent for easy navigation, and we keep
  map controls (such as the filter) separate form the navigation to avoid
  unneccessary clutter.

4. Design Process, User Testing, and Iterative Design [10 pts]
   The design process was begun with storyboarding and a short competitive analyis.  
   We had to redo these steps from our initial storyboarding due to our project changing 
   directions. Several wireframe mockups of the app were then done to create a more 
   refined design of the app's UI and UX. These are included in the design_docs/usability folder 
   in our root directory. 
   After completing the app our group used two different methods of usability testing.  
   First, a heuristic evaluation was completed.  The app was searched for anything 
   that violates Nielsen's ten usability heuristics.  These were recorded in heuristicEval.txt in the 
   usability folder. The second usability test was user testing through a think aloud. 
   New users to the system were assigned tasks to try to complete and they were observed while completing these
   tasks.  Any task they had problems with was noted as something that needs redesigned.
   Notes from these studies are included in the design_docs/usability folder. 
   

5. Effort [10 pts]

6. Code Design / Style [5 pts]
  We used an MVC frameowrk in app/ to clearly separate our code. We also used a
  doxygen-esque commenting framework to document our code.

7. Presentation [5 pts]
  Next Friday!

