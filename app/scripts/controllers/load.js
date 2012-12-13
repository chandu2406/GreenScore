/** @file load.js
 *  @brief Controller to initialize handlers, and the navBar
 *
 *  @author Kenneth Murphy (kmmurphy)
 *  @author Nick LaGrow (nlagrow)
 *  @bug No local storage currently
 */

/*  need to write a function to deal with a new search
 *     --remove all current markers
 *     --change coordinates of map center
 *     --query zillow/database again
 */

$(document).ready(function(e) {
    // Click event handler for facebook login
    $("#fb_button").on("click", function() {
        window.open("/auth/facebook","_self");
    });

    $("#profilePage").on("pagebeforeshow", function() {
      $("#welcomeMessage").html("Hello user!");
    });

    // If we've logged in before, switch to profile instead of login in nav
    if (typeof(localStorage !== "undefined")) {
      if(window.localStorage["greenscore_username"] !== undefined) {
        // Change login text to profile text
        $('.loginBtn').html('<h2>Profile</h2>');

        // Remove previous click bindings
        $('.loginBtn').off('click');

        // Change login links to profile links
        $('.loginBtn').addClass('profileBtn');
        $('.loginBtn').removeClass('loginBtn');
        $(".profileBtn").on("click", function() {
            $.mobile.changePage($("#profilePage"), {transition: "slideup"});
        });
      }
    }

    // Click event handler for login button
    $('#login_button').on('click', function() {
      var req_fifo;

      // GetAsyncData sends a request to read the fifo.
      function GetAsyncData() {
        var url = "/login";
        var hashed_pass = CryptoJS.SHA256(escape($('#password').val()));
        var params = "username=" + escape($('#username').val()) +
                     "&password=" + hashed_pass;

        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest) {
          req_fifo = new XMLHttpRequest();
          req_fifo.abort();
          req_fifo.onreadystatechange = GotAsyncData;
          req_fifo.open("POST", url+"?"+params, true);
          req_fifo.send(null);
        }
      }

      function GotAsyncData() {
        if (req_fifo.readyState != 4 || req_fifo.status != 200) {
          return;
        }
        var response = JSON.parse(req_fifo.response);

        // If the user successfully logged in:
        if (response['success'] === 'true') {
          // Store that we've logged in
          if (typeof(localStorage !== "undefined")) {
            window.localStorage["greenscore_username"] = response["user_id"]; 
          }

          // Change login text to profile text
          $('.loginBtn').html('<h2>Profile</h2>');

          // Remove previous click bindings
          $('.loginBtn').off('click');

          // Change login links to profile links
          $('.loginBtn').addClass('profileBtn');
          $('.loginBtn').removeClass('loginBtn');
          $(".profileBtn").on("click", function() {
              $.mobile.changePage($("#profilePage"), {transition: "slideup"});
          });
          $.mobile.changePage($("#profilePage"), {transition: "slideup"});
        }

        return;
      }
      GetAsyncData();
    });

    // Click event handler for register button
    $('#register_button').on('click', function() {
      var req_fifo;

      // GetAsyncData sends a request to read the fifo.
      function GetAsyncData() {
        var url = "/register";
        var hashed_pass = CryptoJS.SHA256(escape($('#new_password').val()));
        var params = "username=" + escape($('#new_username').val()) +
                     "&password=" + hashed_pass +
                     "&email=" + escape($('#new_email').val()) +
                     "&address=" + escape($('#new_address').val());

        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest) {
          req_fifo = new XMLHttpRequest();
          req_fifo.abort();
          req_fifo.onreadystatechange = GotAsyncData;
          req_fifo.open("POST", url+"?"+params, true);
          req_fifo.send(null);
        }
      }

      function GotAsyncData() {
        if (req_fifo.readyState != 4 || req_fifo.status != 200) {
          return;
        }
        var response = JSON.parse(req_fifo.response);
        // If the user successfully logged in:
        if (response['success'] === 'true') {
          // Store that we've logged in
          if (typeof(localStorage !== "undefined")) {
            window.localStorage["greenscore_username"] = response["user_id"]; 
          }

          // Change login text to profile text
          $('.loginBtn').html('<h2>Profile</h2>');

          // Remove previous click bindings
          $('.loginBtn').off('click');

          // Change login links to profile links
          $('.loginBtn').addClass('profileBtn');
          $('.loginBtn').removeClass('loginBtn');
          $(".profileBtn").on("click", function() {
              $.mobile.changePage($("#profilePage"), {transition: "slideup"});
          });
          $.mobile.changePage($("#profilePage"), {transition: "slideup"});
        } else {
          alert ('Sorry, something went wrong with registering your account.');
        }

        return;
      }
      GetAsyncData();
    });

    //attach page change event to navBar
    $(".searchBtn").on("click", function() {
        $.mobile.changePage($("#landingPage"), {transition: "slideup"});
    });
    $(".profileBtn").on("click", function() {
        $.mobile.changePage($("#profilePage"), {transition: "slideup"});
    });
    $(".loginBtn").on("click", function() {
        $.mobile.changePage($("#loginPage"), {transition: "slideup"});
    });
    $(".mapBtn").on("click", function() {
        $.mobile.changePage($("#mapView"), {transition: "slideup"});
    });
    $(".filterBtn").on("click", function() {
        $.mobile.changePage($("#filterPage"), {transition: "slideup"});
    });

    //attach indicator and color change to the navbar on each page
    var indicator = $("<img></img>");
    indicator.attr("src","./assets/selection.png");

    indicator.css("left", "8px");
    $("#landingPage").find(".searchBtn").append(indicator.clone());
    $("#newUserPage").find(".profileBtn").append(indicator.clone());
    $("#profilePage").find(".profileBtn").append(indicator.clone());
    indicator.css("left", "6px");
    $("#filterPage").find(".filterBtn").append(indicator.clone());
    indicator.css("left", "5px");
    $("#loginPage").find(".loginBtn").append(indicator.clone());
     indicator.css("left", "3px");
    $("#mapView").find(".mapBtn").append(indicator.clone());


    //attach filters
    $("#priceFilter").on("click", filter.byPrice);
    $("#bathFilter").on("click", filter.byNumBath);
    $("#bedFilter").on("click", filter.byNumBed);

    $("#filterOverlay").on("click", function(){
        $.mobile.changePage($("#filterPage"), {transition: "slideup"});
    });
});
