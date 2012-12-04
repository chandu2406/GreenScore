/** @file mapView.js
 *  @brief model of the map object
 *
 *  @author Kenneth Murphy (kmmurphy)
 */


var gMap = {};
//globals to hold map and info window
gMap.map;
gMap.infoWindow;

gMap.newMarkers = [];
gMap.markers = [];


gMap.Marker = function(){
    this.latLong;
    this.address;
    this.data;
}

/** @brief Initializes a event handler to load the google map the first time the page is shown, and add markers to the map
 *
 *	@param residence- information retrieved from the zillow API that the user entered
 *
 */
gMap.init = function(residence){
    
    var mapOptions = {
	center: new google.maps.LatLng(residence.lat, residence.long),
	zoom: 13,
	mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    gMap.newMarker(residence);

    $("#mapView").on("pageshow", function(){
	//if the div holding the map is empty, initialize the map
	if($("#map_canvas").children().length === 0){
	    gMap.infoWindow = new google.maps.InfoWindow();
	    gMap.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	}

	//initialize all new markers on the page
	gMap.initMarkers();
    });
}

/** @brief Function called to retrieve info from Zillow API for a single address
 *
 *	@param addr-a userAddress object to retrieve information on
 *
 */
gMap.updateCoors = function (lat, long){
    console.log("updating center of map coordinates");
    var latLong = new google.maps.LatLng(lat,long);
    gMap.map.setCenter(latLong);
}

/** @brief Creates a new marker object and adds it to an array of markers that 
 *         will be created on the next pageshow event
 *
 *	@param data - info about where to place the marker and what data will be associated with it
 *
 */
gMap.newMarker = function(residence){
    var marker;
    //create a new marker object as defined above
    marker = new gMap.Marker();
    marker.latLong = new google.maps.LatLng(residence.lat, residence.long);
    marker.addr = residence.street+", "+residence.city+" "+residence.state+", "+residence.zipcode;
    marker.data = residence;
    //add it to the newMarker array to be initialized on pageshow
    gMap.newMarkers.push(marker);
}

/** @brief Creates all markers in the newMarker array and adds them to the map
 *
 */
gMap.initMarkers = function(){
    var i, marker, newMarker, contentStr, infowindow;
    for (i=0; i<gMap.newMarkers.length; i++) {
	marker = gMap.newMarkers[i];
	console.log("creating marker at "+marker.latLong);
	newMarker = new google.maps.Marker({
	    position: marker.latLong,
	    map: gMap.map,
	    title: marker.addr,
	    optimized: false,
	    clickable: true,
	    visable: true
	});
	gMap.markers.push(marker);
	gMap.attachData(newMarker, marker.data);
    }
    gMap.newMarkers = [];
}

/** @brief attaches info about a residence to a marker so that when clicked, the marker will display
 *         the information in an attractive format
 *
 *  @param marker- newly ititialized marker on which to attach an event handler to display data
 *  @param residence- the residence data to associate with that marker. 
 */
gMap.attachData = function(marker, residence){
    var content, child;
    
    content = document.createElement('div');

    for(prop in residence){
	child = document.createElement('h2');
	child.innerHTML = prop+": "+residence[prop];
	content.appendChild(child);
    }

    

    google.maps.event.addListener(marker, 'click', function() {
	gMap.infoWindow.setContent(content);
	gMap.infoWindow.open(gMap.map, marker);
    });
}

