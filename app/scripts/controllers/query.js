/** @file query.js
 *  @brief Controller to retrieve info from the Zillow API and database
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

var queryHandler = {};

queryHandler.socket = io.connect('http://localhost:3000/');
// unique identifier to access Zillow APIs
queryHandler.ZWSID = "X1-ZWz1bjzdhxm7m3_af1tq";
queryHandler.searchedAddr = new Residence();

/** @brief Function called to retrieve info from Zillow API 
 *				 for a single address and from the database
 *
 *  @param addr-a userAddress object to retrieve information on
 *
 */
queryHandler.searchAddress = function(addr) {
    var urlAddr, path;

    // url format the address by replacing all spaces with pluses in the route
    urlAddr = addr.streetNum+"+"+addr.street.split(" ").join("+");
    // return a path to the api query that will appended to the zillow domain
    // name
    path = "/webservice/GetDeepSearchResults.htm?zws-id="+queryHandler.ZWSID+
        "&address="+urlAddr+"&citystatezip="+addr.zipcode;
    console.log("sending simpleSearch event");
    // send the url to the server.  The server will query the API and return
    // the response.
    queryHandler.socket.emit("simpleSearch", {'path': path});

    $("#searchBar").val(" ");
}

/** @brief Function called to retrieve houses in the area that are comparable
 *         to the address the user entered
 *
 *  @param zpid - the unique identifier of the residence for which Zillow
 *                will find comparable properties
 *  @param count - number of houses to return a count of
 */
queryHandler.getComp = function(zpid,count){
    // form the URL to call
    var path = "/webservice/GetDeepComps.htm?zws-id="+queryHandler.ZWSID+
        "&zpid="+zpid+"&count="+count;
    console.log("sending compSearch event");
    queryHandler.socket.emit("compSearch", {'path': path});
}

queryHandler.getDemographics = function(regionId){
    //form the URL to call
    var path = "/webservice/GetDemographics.htm?zws-id="+queryHandler.ZWSID+
        "&regionid="+regionId;
    console.log("sending getDemographics event");
    queryHandler.socket.emit("getDemo", {'path': path});
}



/** @brief receive api response from server for the search of a single address
 *
 */
queryHandler.socket.on("searchResults", function(data) {
    var txt, xmlDoc, xml, zpid, lat, long;
    // parse api return into an XML document
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
    newRes.priceEst = $(this).find("amount").text();
    newRes.numBath = $xml.find("bathrooms").text();
    newRes.numBed = $xml.find("bedrooms").text();
    newRes.greenscore = $.parseJSON(
	$.ajax({
	    type: 'GET',
	    url: 'http://localhost:8080/json/getGreenscore?sqft=' + newRes.sqFt,
	    async: false
	}).responseText)['result'];

    // reset the set of residences
    Residences.all = {};
    Residences.all[newRes.zpid] = newRes;

    // initiatize the map if neccessary, otherwise update the coordinates of
    // the center of the map
    if ($("#map_canvas").children().length === 0) {
	gMap.init(newRes);
    } else {
	gMap.updateCoors(newRes.lat,newRes.long);
    }

    queryHandler.getComp(newRes.zpid, 25);
    
});


/** @brief Receive api response from server that contains a list of
 *         comparable sales for a specific property
 *
 */
queryHandler.socket.on("compResults", function(data){
    var txt, xmlDoc, xml, zpid, newRes, errorCode;

    console.log("received results from comp search");
    txt = data.zillowData;

    xmlDoc = $.parseXML(txt);
    $xml = $(xmlDoc);
    /*
    errorCode = $(xml).find("code").text();
    console.log("GetDeepComp exitted with error code "+errorCode);
    */
    $xml.find("comp").each(function() {
	zpid = $(this).find("zpid").text();
	console.log(zpid);
	if (typeof(Residences.all[zpid]) === 'undefined') {
	    newRes = new Residence();
	    newRes.zpid = zpid;
	    newRes.lat = $(this).find("latitude").text();
	    newRes.long = $(this).find("longitude").text();
	    newRes.street = $(this).find("street").text();
	    newRes.city = $(this).find("city").text();
	    newRes.state =  $(this).find("state").text();
	    newRes.zipcode = $(this).find("zipcode").text();
	    newRes.sqFt = $(this).find("finishedSqFt").text();
            newRes.priceEst = $(this).find("amount").text();
	    newRes.numBath = $(this).find("bathrooms").text();
	    newRes.numBed = $(this).find("bedrooms").text();
	    newRes.greenscore = $.parseJSON(
		$.ajax({
		    type: 'GET',
		    url: 'http://localhost:8080/json/getGreenscore?sqft=' + newRes.sqFt,
		    async: false
		}).responseText)['result'];
	    console.log(newRes);
	    
	    Residences.all[zpid] = newRes;
	    gMap.newMarker(newRes);
	    
	}
    });
    
    queryHandler.displayResults();
});


/** @brief Receive api response from server that contains 
 *         information about a neighborhood
 *
 */
queryHandler.socket.on("demoResults", function(data){
    var txt, xmlDoc, xml;
    console.log("demographics returned");
    txt = data.zillowData;

    xmlDoc = $.parseXML(txt);
    $xml = $(xmlDoc);
   
    tData = new tempNeighborhood();
    
    tData.medianSalePrice = queryHandler.findAttr("Median Sale Price", xml);
    tData.medianHomeSize =  queryHandler.findAttr("Median Home Size (Sq. Ft.)", xml);
    tData.avgYearBuilt = queryHandler.findAttr("Avg. Year Built", xml);
    tData.medianIncome = queryHandler.findAttr("Median Household Income", xml);
    tData.medianAge = queryHandler.findAttr("Median Age", xml);
    tData.avgCommute = queryHandler.findAttr("Average Commute Time (Minutes)", xml);
   
    //call another function to pass the data to the canvas drawer

});


queryHandler.findAttr = function(name, xml){
    var name, value;
    
    $xml.find("attribute").each(function() {
        if($(this).find("name").text() === name){
            value = $(this).find("neighborhood");
            console.log("found "+name);
            console.log(parseInt($(value).find("value").text()));
            return parseInt($(value).find("value").text());
        }
    });
}

queryHandler.displayResults = function() {
    $.mobile.changePage($("#mapView"), { transition: "slideup"} );
}


//temporary object to hold neighborhood data
//   -tried to choose interesting data(there's a lot of other stats)
function tempNeighborhood() {
    this.medianSalePrice;
    this.medianHomeSize;
    this.avgYearBuilt;
    //median household income
    this.medianIncome;
    this.medianAge;
    this.avgCommute;
}
