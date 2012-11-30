/** @file mapHandler.js
 *  @brief controller to initiate and update map object
 *
 *  @author Kenneth Murphy (kmmurphy)
 */



function mapInit(data){
	console.log("changing page");
	$.mobile.changePage($("#mapView"), { transition: "slideup"} );
	
	$("#mapView .contentBubble").css("height", "80%");
	$("#map_canvas").css("height", "100%");
	$("#map_canvas").css("width", "100%");
	
	
	var mapOptions = {
		center: new google.maps.LatLng(data.lat, data.long),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	//center = new google.maps.LatLng(data.lat, dat);
	var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
}
