/** @file queryZillow.js
 *  @brief Controller to retrieve info from the Zillow API
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

var zillowHandler = {};


zillowHandler.socket = io.connect('http://localhost:3000/');
//unique identifier to access Zillow APIs
zillowHandler.ZWSID = "X1-ZWz1bjzdhxm7m3_af1tq";
zillowHandler.searchedAddr = new Residence();

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
    console.log("sending simpleSearch event");
    //send the url to the server.  The server will query the API and return the response.
    zillowHandler.socket.emit("simpleSearch", {'path': path});
    
    $("#searchBar").val(" ");
    
}

/** @brief Function called to retrieve houses in the area that are comparable to the 
 *					address the user entered
 *
 *	@param zpid - the unique identifier of the residence for which Zillow will find comparable properties
 * @param count - number of houses to return a count of
 */
zillowHandler.getComp = function(zpid,count){
    //form the URL to call
    var path = "/webservice/GetDeepComps.htm?zws-id="+zillowHandler.ZWSID+"&zpid="+zpid+"&count="+count;	
    console.log("sending compSearch event");
    zillowHandler.socket.emit("compSearch", {'path': path});
}


/** @brief receive api response from server for the search of a single address
 *
 */
zillowHandler.socket.on("searchResults", function(data){
    var txt, xmlDoc, xml, zpid, lat, long;
    //parse api return into an XML document
    txt = data.zillowData;
    xmlDoc = $.parseXML(txt);
    $xml = $(xmlDoc);
    console.log("xml for single search: "+txt);
    newRes = new Residence();
    newRes.zpid =  $xml.find("zpid").text();
    newRes.lat = $xml.find("latitude").text();
    newRes.long = $xml.find("longitude").text();
    newRes.street = $xml.find("street").text();
    newRes.city = $xml.find("city").text();
    newRes.state =  $xml.find("state").text();
    newRes.zipcode = $xml.find("zipcode").text();
    newRes.sqFt = $xml.find("finishedSqFt").text();
    newRes.numBath = $xml.find("bathrooms").text();
    newRes.numBed = $xml.find("bedrooms").text();
    
    //reset the set of residences
    allResidences = {};
    
    allResidences[newRes.zpid] = newRes;
    
    //initiatize the map if neccessary, otherwise update the coordinates of the center of the map
    if($("#map_canvas").children().length === 0){
	gMap.init(newRes);
    }  else {
	gMap.updateCoors(newRes.lat,newRes.long);
    }
    
    zillowHandler.getComp(newRes.zpid, 25);
});


/** @brief receive api response from server that contains a list of comparable sales for a specific property
 *
 */
zillowHandler.socket.on("compResults", function(data){
    var txt, xmlDoc, xml, zpid, newRes;
    
    console.log("received results from comp search");
    txt = data.zillowData;
    console.log(txt);
    xmlDoc = $.parseXML(txt);
    $xml = $(xmlDoc);
    
    
    $xml.find("comp").each(function(){
	zpid = $(this).find("zpid").text();
	console.log(zpid);
	if(typeof(allResidences[zpid]) === 'undefined'){
	    newRes = new Residence();
	    newRes.zpid = zpid;
	    newRes.lat = $(this).find("latitude").text();
	    newRes.long = $(this).find("longitude").text();
	    newRes.street = $(this).find("street").text();
	    newRes.city = $(this).find("city").text();
	    newRes.state =  $(this).find("state").text();
	    newRes.zipcode = $(this).find("zipcode").text();
	    newRes.sqFt = $(this).find("finishedSqFt").text();
	    newRes.numBath = $(this).find("bathrooms").text();
	    newRes.numBed = $(this).find("bedrooms").text();
	    console.log(newRes);
	    allResidences[zpid] = newRes;
	    gMap.newMarker(newRes);
	}
    });
    
    zillowHandler.displayResults();
    
});

zillowHandler.displayResults = function(){ 		
    $.mobile.changePage($("#mapView"), { transition: "slideup"} );
}

