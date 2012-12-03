/** @file mapView.js
 *  @brief model of the map object
 *
 *  @author Kenneth Murphy (kmmurphy)
 */


var gMap = {};

gMap.map;
gMap.newMarkers = [];
gMap.markers = [];

gMap.infoWindow;
//can add other info for this
gMap.Marker = function(){
    this.latLong;
    this.address;
    this.data;
}

/** @brief Function called to retrieve info from Zillow API for a single address
 *
 *	@param addr-a userAddress object to retrieve information on
 *
 */
gMap.init = function(data){
    
    var mapOptions = {
	center: new google.maps.LatLng(data.lat, data.long),
	zoom: 13,
	mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    gMap.newMarker(data);

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

/** @brief Function called to retrieve info from Zillow API for a single address
 *
 *	@param addr-a userAddress object to retrieve information on
 *
 */
gMap.newMarker = function(data){
    var marker;
    //create a new marker
    marker = new gMap.Marker();
    marker.latLong = new google.maps.LatLng(data.lat, data.long);
    console.log("pushing marker into newMarker array at "+marker.latLong);
    marker.addr = data.street+", "+data.city+" "+data.state+", "+data.zipcode;
    marker.data = data;
    //add it to the newMarker array to be initialized on pageshow
    gMap.newMarkers.push(marker);
}

/** @brief Function called to retrieve info from Zillow API for a single address
 *
 *	@param addr-a userAddress object to retrieve information on
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

/** @brief Function called to retrieve info from Zillow API for a single address
 *
 *	@param addr-a userAddress object to retrieve information on
 *
 */
gMap.attachData = function(marker, data){
    var content, child;
    
    content = document.createElement('div');

    for(prop in data){
	child = document.createElement('h2');
	child.innerHTML = prop+": "+data[prop];
	content.appendChild(child);
    }

    

    google.maps.event.addListener(marker, 'click', function() {
	gMap.infoWindow.setContent(content);
	gMap.infoWindow.open(gMap.map, marker);
    });
}

