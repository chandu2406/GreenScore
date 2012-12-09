/** @file load.js
 *  @brief Controller to initialize handlers, and the navBar
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

/*  need to write a function to deal with a new search
 *     --remove all current markers
 *     --change coordinates of map center
 *     --query zillow/database again
 */



$(document).ready(function(e) {    
    // click event handler for facebook login
    $("#fb_button").on("click", function() {
        window.open("/auth/facebook","_self");
    });

    $('#login_button').on('click', function() {
      console.log('pressed login button');
      var req_fifo;

      // GetAsyncData sends a request to read the fifo.
      function GetAsyncData() {
        var url = "/login";
        var params = "username=" + $('#username').val() + "&password=" + $('#password').val();

        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest) {
          req_fifo = new XMLHttpRequest();
          req_fifo.abort();
          req_fifo.onreadystatechange = GotAsyncData;
          console.log(url+'?'+params);
          req_fifo.open("POST", url+"?"+params, true);
          req_fifo.send(null);
        } 
      }

      function GotAsyncData() {
        if (req_fifo.readyState != 4 || req_fifo.status != 200) {
          return;
        }
        var response = JSON.parse(req_fifo.response);
        console.log(response);
        console.log(response.message);

        if (response['success'] === 'true') {
          $('.loginBtn').html('<h2>Profile</h2>');
          $('.loginBtn').off('click');
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
    //$(".profileBtn").on("click", function() {
    //    $.mobile.changePage($("#profilePage"), {transition: "slideup"});
    //});
    
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
