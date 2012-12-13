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
      if (typeof(localStorage !== "undefined")) {
        if(window.localStorage["greenscore_username"] !== undefined) {
          var username = window.localStorage["greenscore_username"];
          $("#welcomeMessage").html("Welcome " + username + "!");

          // Get the user's info to populate the profile
          function GetProfileData() {
            var url = "/get_user_data";
            var params = "username=" + username;

            // branch for native XMLHttpRequest object
            if (window.XMLHttpRequest) {
              profile_data_fifo = new XMLHttpRequest();
              profile_data_fifo.abort();
              profile_data_fifo.onreadystatechange = ProcessProfileData;
              profile_data_fifo.open("GET", url+"?"+params, true);
              profile_data_fifo.send(null);
            }
          }

          function ProcessProfileData() {
            if (profile_data_fifo.readyState != 4 || profile_data_fifo.status != 200) {
              return;
            }
            var response = JSON.parse(profile_data_fifo.response);

            // If the user successfully logged in:
            if (response['success'] === 'true') {
              // Set the user's full name
              $("#profileName").html("Name: "+response["user_id"]);
              // Set the user's username
              $("#profileUsername").html("Username: "+response["user_id"]);
              // Set the user's email
              $("#profileEmail").html("Email: "+response["email"]);

              // Get and set the user's greenscore and address
              GetAddressData(response["address"]);
            }
          }

          function GetAddressData(address) {
            var url = "/get_address_data";
            var params = "address="+escape(address);

            console.log(" get address data");

            // branch for native XMLHttpRequest object
            if (window.XMLHttpRequest) {
              address_data_fifo = new XMLHttpRequest();
              address_data_fifo.abort();
              address_data_fifo.onreadystatechange = ProcessAddressData;
              address_data_fifo.open("GET", url+"?"+params, true);
              address_data_fifo.send(null);
            }
          }

          function ProcessAddressData() {
            if (address_data_fifo.readyState != 4 || address_data_fifo.status != 200) {
              return;
            }
            var response = JSON.parse(address_data_fifo.response);

            // If the user successfully logged in:
            if (response['success'] === 'true') {
              console.log("great success!");
              console.log(response['data']);
              window.userData = response['data'];

              // Build the user's address table and show it
              var row = $('#profileRow');
              var to_append="";
              to_append += "<td>"+response['data']['ADDRESS']+"</td>";
              to_append += "<td>"+response['data']['NUM_BATHS']+"</td>";
              to_append += "<td>"+response['data']['NUM_BEDS']+"</td>";
              to_append += "<td>"+response['data']['SQFT']+"</td>";
              to_append += "<td>"+(response['data']['SOLAR']? "YES" : "NO") +"</td>";
              row.html(to_append);

              queryHandler.searchHome(response['data']['ADDRESS']);
            }
          }


          GetProfileData();
        }
      }
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

    // Click event handler for modify information button
    $("#puf_button").on("click", function () {
      var user_fifo;
      var address_fifo;
      var username;

      if (typeof(localStorage !== "undefined")) {
        if(window.localStorage["greenscore_username"] !== undefined) {
          username = window.localStorage["greenscore_username"];
        } else {
          alert("You need to be logged in to do that.");
        }
      } else {
        alert("You need to be logged in to do that.");
      }

      function SendModifyUser() {
        var url = "/modify_user";

        var address = $('#puf_address').val();
        var email = $('#puf_email').val();

        var params = "username=" + escape(username) +
          (address === "" ? "" : "&address="+escape(address)) +
          (email === "" ? "" : "&email="+escape(email))

        // ignore blank requests
        if ($('#puf_address').val() === "" && $('#puf_email').val() === "") {
          console.log("blank request");
          return;
        }

        console.log("send modify_user:");
        console.log(params);

        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest) {
          user_fifo = new XMLHttpRequest();
          user_fifo.abort();
          user_fifo.onreadystatechange = ProcessModifyUser;
          user_fifo.open("POST", url+"?"+params, true);
          user_fifo.send(null);
        }
      }
      
      function ProcessModifyUser() {
        if (user_fifo.readyState != 4 || user_fifo.status != 200) {
          console.log("blank request");
          return;
        }
        var response = JSON.parse(user_fifo.response);
        // If the user successfully logged in:
        if (response['success'] === 'true') {
          console.log("got modify user");
          SendModifyAddress();
        }
      }

      function SendModifyAddress() {
        var url = "/modify_address";

        var address = $('#puf_address').val();
        var email = $('#puf_email').val();
        var num_beds = $('#puf_num_beds').val();
        var num_baths = $('#puf_num_baths').val();
        var sqft = $('#puf_sqft').val();
        var solar = $('#puf_solar').val();

        var params = "address=" + escape(address) +
          (num_beds === "" ? "" : "&num_beds="+escape(num_beds)) +
          (num_baths === "" ? "" : "&num_baths="+escape(num_baths)) +
          (sqft === "" ? "" : "&sqft="+escape(sqft)) +
          (solar === "" ? "" : "&solar="+escape(solar))

        // ignore blank requests
        if ($('#puf_address').val() === "") {
          return;
        }

        console.log("send modify:");
        console.log(params);

        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest) {
          address_fifo = new XMLHttpRequest();
          address_fifo.abort();
          address_fifo.onreadystatechange = ProcessModifyAddress;
          address_fifo.open("POST", url+"?"+params, true);
          address_fifo.send(null);
        }
      }
      
      function ProcessModifyAddress() {
        if (address_fifo.readyState != 4 || address_fifo.status != 200) {
          return;
        }
        var response = JSON.parse(address_fifo.response);
        // If the user successfully logged in:
        if (response['success'] === 'true') {
          console.log("got modify");

          $('#puf_num_beds').val("");
          $('#puf_num_baths').val("");
          $('#puf_sqft').val("");
          $('#puf_solar').val("");

          // TODO more elegant way to refresh page
          $.mobile.changePage($("#loginPage"), {transition: 'slidedown'});
          $.mobile.changePage($("#profilePage"), {transition: 'slideup'});
        }
      }
      SendModifyUser();
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

    // patch all the things
    window.util.patchFnBind();

    // always close the loader on page show
    $(document).on('pageshow', function() {
      $.modal.close();
    });

});
