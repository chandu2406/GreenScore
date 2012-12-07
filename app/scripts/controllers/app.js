/** @file app.js
 *  @brief Controller to initialize the app
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

$(document).ready(function(e) {

    
    var geocoder, addrComponents, addrLat, addrLong;
    //watermarks for text input fields
    $("#searchBar").watermark("Please enter an address");
    $("#username").watermark("Username");
    $("#password").watermark("Password");
    $("#fullName").watermark("Please enter your name");
    $("#newAddr").watermark("Please enter your address");

    
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
    });


    /*on enter in the address box, queryZillow. Will have to have this 
     *option as a button for mobile version
     */
    $("#searchBar").bind("keyup", function(event){
        if(event.keyCode == 13){
            console.log("querying zillow");
            var zillowAddr, i, component;

            // loading page
            $.mobile.loading('show', {
                text: 'Searching...',
                textVisible: true,
                theme: 'c'
            });

            zillowAddr = new userAddress();
            if(typeof(addrComponents) === 'undefined'){
                alert("Please enter a valid address");
            }else {
                for(i=0; i<addrComponents.length; i++){
                    console.log(addrComponents);
                    component = addrComponents[i];
                    if(component.types[0] === "street_number"){
                        zillowAddr.streetNum = component.long_name;
                    }else if(component.types[0] === "route"){
                        zillowAddr.street = component.long_name;
                    }else if(component.types[0] === "postal_code"){
                        zillowAddr.zipcode = component.long_name;
                    }
                }
            }
            zillowHandler.searchAddress(zillowAddr);
        }
    });
});


function userAddress(){
    this.streetNum;
    this.street;
    this.zipcode;
}


