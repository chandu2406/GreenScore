/** @file mapHandler.js
 *  @brief controller to initiate and update map object
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

var gMap = {};

gMap.map;
gMap.newMarkers = [];
gMap.markers = [];

//can add other info for this
gMap.Marker = function(){
	this.latLong;
	this.address;
}


gMap.init = function(data){
	
	var mapOptions = {
		center: new google.maps.LatLng(data.lat, data.long),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	gMap.newMarker(data);
	
	$("#mapView").on("pageshow", function(){
		//if the div holding the map is empty, initialize the map
		if($("#map_canvas").children().length === 0){
			gMap.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
		}
		//initialize all new markers on the page
		gMap.initMarkers();
	});
}

gMap.updateCoors = function (data){
	console.log("updating center of map coordinates");
	var latLong = new google.maps.LatLng(data.lat, data.long);
	gMap.map.setCenter(latLong);
}

gMap.newMarker = function(data){
	var marker;
	//create a new marker
	marker = new gMap.Marker();
	marker.latLong = new google.maps.LatLng(data.lat, data.long);
	console.log("pushing marker into newMarker array at "+marker.latLong);
	marker.addr = data.street+", "+data.city+" "+data.state+", "+data.zipcode;
	//add it to the newMarker array to be initialized on pageshow
	gMap.newMarkers.push(marker);
}

gMap.initMarkers = function(){
	var marker, i;
	console.log(gMap.newMarkers);
	for (i=0; i<gMap.newMarkers.length; i++) {
		marker = gMap.newMarkers[i];
		console.log("creating marker at "+marker.latLong);
		newMarker = new google.maps.Marker({
			position: marker.latLong,
			map: gMap.map,
			title: 'Hello there',
			optimized: false,
			clickable: true,
			visable: true
		});
		gMap.markers.push(marker);
	}
	gMap.newMarkers = [];
	
}

