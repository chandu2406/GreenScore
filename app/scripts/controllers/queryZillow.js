/** @file queryZillow.js
 *  @brief Controller to retrieve info from the Zillow API
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

var zillowHandler = {};


zillowHandler.socket = io.connect('http://localhost:3000/');
//unique identifier to access Zillow APIs
zillowHandler.ZWSID = "X1-ZWz1bjzdhxm7m3_af1tq";

/** @brief Object to hold information returned from the Zillow API
  */
zillowHandler.ZillowData = function() {
  this.zpid;
	this.lat;
	this.long;
  this.street;
  this.city;
  this.state;
  this.zipcode;
  this.sqFoot;
  this.numBed;
  this.numBath;
  this.maxPrice;
  this.minPrice;
};

/** @brief Function called to retrieve info from Zillow API for a single address
  *
	*	@param addr-a userAddress object to retrieve information on
	*
	*/
zillowHandler.searchAddress = function(addr){
	var urlAddr, path;
	
  //url format the address by replacing all spaces with pluses in the route
  urlAddr = addr.streetNum+"+"+addr.street.split(" ").join("+"); 
  //return a path to the api query that will appended to the zillow domain name
  path = "/webservice/GetDeepSearchResults.htm?zws-id="+zillowHandler.ZWSID+"&address="+urlAddr+"&citystatezip="+addr.zipcode;
	console.log("emitting simplesearch event");
	//send the url to the server.  The server will query the API and return the response.
  zillowHandler.socket.emit("simpleSearch", {'path': path});
	
	$("#searchBar").val(" ");
	
}

/** @brief Function called to retrieve 25 houses in the area that are comparable to the 
	*					address the user entered
  */
zillowHandler.getComp = function(addr){


}
/** @brief receive api response from server and parses the response
   * the resulting information is then sent to the mapView
   */
zillowHandler.socket.on("searchResults", function(data){
	var txt, xmlDoc, xml, zillowData;
	console.log("received results from simple search");
	txt = data.zillowData;
	
	console.log(txt);
	
	xmlDoc = $.parseXML(txt);
	$xml = $(xmlDoc);
	
	zillowData = new zillowHandler.ZillowData();
	zillowData.lat = $xml.find("latitude").text();
	zillowData.long = $xml.find("longitude").text();
	zillowData.street = $xml.find("street").text();
	zillowData.city = $xml.find("city").text();
	zillowData.state =  $xml.find("state").text();
	zillowData.zipcode = $xml.find("zipcode").text();
	zillowData.sqFt = $xml.find("finishedSqFt").text();
	zillowData.numBath = $xml.find("bathrooms").text();
	zillowData.numBed = $xml.find("bedrooms").text();
	
	zillowHandler.displayResults(zillowData);
  
});

zillowHandler.displayResults = function(results){
  /*
	$("#mapView").on("pagechange", function(){
			console.log("page change function called");
			console.log("results are currently: "+results);
			gMap.init(results);
	});*/
	console.log("changing page");
	/*$.mobile.loadPage("#mapView");
	$("#mapView").ready(function(){
		gMap.init(results);
	});
	*/
	
	$.mobile.changePage($("#mapView"), { transition: "slideup"} );
	//initiatize the map if it hasn't already been initialized
	if($("#map_canvas").children().length === 0){
		gMap.init(results);
	} else{
		gMap.newMarker(results);
	}
}




