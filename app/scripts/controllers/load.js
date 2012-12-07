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

    //attach filters
    $("#priceFilter").on("click", filter.byPrice);
    $("#bathFilter").on("click", filter.byNumBath);
    $("#bedFilter").on("click", filter.byNumBed);
    
    $("#filterOverlay").on("click", function(){
        $.mobile.changePage($("#filterPage"), {transition: "slideup"});
    });
    

});
