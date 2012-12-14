/** @file app.js
 *  @brief Controller to initialize the app
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

//tmp path to socket.io for when testing on mobile
var ipAddr = 'localhost';
//var ipAddr = '128.237.224.140';



$(document).ready(function(e) {


    var geocoder, addrComponents, addrLat, addrLong;
    //watermarks for text input fields
    $("#searchBar").watermark("Please enter an address");
    $("#username").watermark("Username");
    $("#password").watermark("Password");
    $("#fullName").watermark("Please enter your name");
    $("#newAddr").watermark("Please enter your address");

    // watermarks for registration
    $("#new_username").watermark("Username");
    $("#new_password").watermark("Password");
    $("#new_password_two").watermark("Password (again)");
    $("#new_email").watermark("Email");
    $("#new_address").watermark("Address");

    // watermarks for updating info
    $("#puf_email").watermark("Update your Email");
    $("#puf_address").watermark("Update your Address");
    $("#puf_num_beds").watermark("Number of bedrooms");
    $("#puf_num_baths").watermark("Number of bathrooms");
    $("#puf_sqft").watermark("Total Square Feet");


    //GEOCODER
    geocoder = new google.maps.Geocoder();
    //autocomplete suggestion code adopted from http://tech.cibul.net/geocode-with-google-maps-api-v3/
    $(function() {
        //uses the jquery UI autocomplete widget
        $("#searchBar").autocomplete({
            //This bit uses the geocoder to fetch address values
            source: function(request, response) {
                geocoder.geocode({'address': request.term},function(results,status) {
                    response($.map(results, function(item) {
                        return {
                            label: item.formatted_address,
                            value: item.formatted_address,
                            latitude: item.geometry.location.lat(),
                            longitude: item.geometry.location.lng(),
                            addressComp: item.address_components
                        }
                    }));
                });
            },
            select: function(event, ui){
                addrComponents = ui.item.addressComp;
                addrLat = ui.item.latitude;
                addrLong = ui.item.longitude;
            }
        });
        $("#puf_address").autocomplete({
            //This bit uses the geocoder to fetch address values
            source: function(request, response) {
                geocoder.geocode({'address': request.term},function(results,status) {
                    response($.map(results, function(item) {
                        return {
                            label: item.formatted_address,
                            value: item.formatted_address,
                            latitude: item.geometry.location.lat(),
                            longitude: item.geometry.location.lng(),
                            addressComp: item.address_components
                        }
                    }));
                });
            }
        });
    });


    /*on enter in the address box, queryAPI. Will have to have this
     *option as a button for mobile version
     */
    $("#searchBar").bind("keyup", function(event){
        if(event.keyCode == 13){
            var queryAddr, i, component;

            show_loading();

            queryAddr = new userAddress();
            if(typeof(addrComponents) === 'undefined'){
                alert("Please enter a valid address");
            }else {
                for(i=0; i<addrComponents.length; i++){
                    component = addrComponents[i];
                    if(component.types[0] === "street_number"){
                        queryAddr.streetNum = component.long_name;
                    }else if(component.types[0] === "route"){
                        queryAddr.street = component.long_name;
                    }else if(component.types[0] === "postal_code"){
                        queryAddr.zipcode = component.long_name;
                    }
                }
            }
            queryHandler.searchAddress(queryAddr);
        }
    });

    $("#queryBtn").on("tap", function(){
        show_loading();

        queryAddr = new userAddress();
        if(typeof(addrComponents) === 'undefined'){
          alert("Please enter a valid address");
        }else {
          for(i=0; i<addrComponents.length; i++){
            component = addrComponents[i];
            if(component.types[0] === "street_number"){
              queryAddr.streetNum = component.long_name;
            }else if(component.types[0] === "route"){
              queryAddr.street = component.long_name;
            }else if(component.types[0] === "postal_code"){
              queryAddr.zipcode = component.long_name;
            }
          }
        }
        queryHandler.searchAddress(queryAddr);
  });

  // show page load
  var show_loading = function() {
    // loading page
    window.$loader = window.$loader ||
      $("<div>", {
        'id': 'loading_div'
      }).append(
        $("<img>", {
          'src': "../assets/ajax-loader.gif",
          'id': "loading_gif"
        })
      ).append(
        $("<div>", {
          'id': 'loading_text'
        }).text("Searching...")
      );

    // load the loading page as a modal
    window.$loader.modal({
      onOpen: function(dialog) {
        dialog.overlay.fadeIn('fast', function() {
          dialog.data.hide();
          dialog.container.fadeIn('fast', function() {
            dialog.data.slideDown('fast');
          });
        });
      },
      opacity: 80,
      overlayCss: {backgroundColor: "#000"}
    });
  }
});




function userAddress(){
    this.streetNum;
    this.street;
    this.zipcode;
}


