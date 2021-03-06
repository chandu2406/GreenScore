/** @file query.js
 *  @brief Controller to retrieve info from the Zillow API and database
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

var queryHandler = {};

//queryHandler.socket = io.connect('http://kettle.ubiq.cs.cmu.edu:15237/');
queryHandler.socket = io.connect('http://'+ipAddr+':3000/');

// unique identifier to access Zillow APIs
queryHandler.ZWSID = "X1-ZWz1bjzdhxm7m3_af1tq";
queryHandler.searchedAddr = new Residence();

/** @brief Function called to retrieve info from Zillow API
 *         for a single address and from the database
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
    // send the url to the server.  The server will query the API and return
    // the response.
    queryHandler.socket.emit("simpleSearch", {'path': path});

    $("#searchBar").val("");
}

/** @brief Function called to retrieve info from Zillow API
 *         for a single address and from the database - does not update map
 *
 *  @param addr a userAddress object to retrieve information on
 *
 */
queryHandler.searchHome = function(addr) {
    var urlAddr, path;

    // url format the address by replacing all spaces with pluses in the route
    urlAddr = (addr.streetNum !== undefined && addr.street !== undefined ?
               addr.streetNum+"+"+addr.street.split(" ").join("+") :
               addr);
    // return a path to the api query that will appended to the zillow domain
    // name
    path = "/webservice/GetDeepSearchResults.htm?zws-id="+
           queryHandler.ZWSID+
           "&address="+urlAddr+
           (addr.zipcode === undefined ? "" : "&citystatezip="+addr.zipcode);
    // send the url to the server.  The server will query the API and return
    // the response.
    queryHandler.socket.emit("uniqueSearch", {'path': path});
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
    queryHandler.socket.emit("compSearch", {'path': path});
}

queryHandler.getDemographics = function(regionId){
    //form the URL to call
    var path = "/webservice/GetDemographics.htm?zws-id="+queryHandler.ZWSID+
        "&regionid="+regionId;
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
    newRes = new Residence();
    newRes.zpid =  $xml.find("zpid").text();
    newRes.lat = $xml.find("latitude").text();
    newRes.long = $xml.find("longitude").text();
    newRes.street = $xml.find("street").text();
    newRes.city = $xml.find("city").text();
    newRes.state =  $xml.find("state").text();
    newRes.zipcode = $xml.find("zipcode").text();
    newRes.sqFt = $xml.find("finishedSqFt").text();
    newRes.lotSize = $xml.find("lotSizeSqFt").text();
    newRes.taxAssessment = $xml.find("taxAssessment").text();    
    newRes.priceEst = $xml.find("amount").text();
    newRes.numBath = $xml.find("bathrooms").text();
    newRes.numBed = $xml.find("bedrooms").text();

    // get the greenscore pseudo-synrchonously (don't populate map until
    // we get result back but allow ui thread to run)
    $.ajax({
      type: 'GET',
    //  url: 'http://kettle.ubiq.cs.cmu.edu:15237/json/getGreenscore?sqft=' + newRes.sqFt,
      url: 'http://'+ipAddr+':15237/json/getGreenscore?sqft=' + newRes.sqFt,
      async: true
    }).done(function(data) {
      var greenscore = $.parseJSON(data)['result'];
      newRes.greenscore = greenscore;

      // reset the set of residences
      Residences.all = {};
      Residences.all[newRes.zpid] = newRes;

      // initiatize the map if neccessary, otherwise update the coordinates of
      // the center of the map
      if ($("#map_canvas").children().length === 0) {
              gMap.init(newRes);
      } else {
        gMap.updateCoors(newRes.lat,newRes.long);
        //remove old markers
        if(gMap.markers.length !== 0){
            console.log("removing old markers");
            for(var i=0; i<gMap.markers.length; i++){
                gMap.markers[i].gMarker.setMap(null);
            }
            gMap.markers = [];
        }

      }

      queryHandler.getComp(newRes.zpid, 25);
    });
});

/** @brief receive api response from server for the search of a single address
 * Does not update map
 * Does not calculate greenscore
 *
 */
queryHandler.socket.on("uniqueResults", function(data) {
    var txt, xmlDoc, xml, zpid, lat, long;
    // parse api return into an XML document
    txt = data.zillowData;
    xmlDoc = $.parseXML(txt);
    $xml = $(xmlDoc);
    newRes = new Residence();
    newRes.zpid =  $xml.find("zpid").text();
    newRes.lat = $xml.find("latitude").text();
    newRes.long = $xml.find("longitude").text();
    newRes.street = $xml.find("street").text();
    newRes.city = $xml.find("city").text();
    newRes.state =  $xml.find("state").text();
    newRes.zipcode = $xml.find("zipcode").text();
    newRes.sqFt = $xml.find("finishedSqFt").text();
    newRes.lotSize = $xml.find("lotSizeSqFt").text();
    newRes.taxAssessment = $xml.find("taxAssessment").text();    
    newRes.priceEst = $(this).find("amount").text();
    newRes.numBath = $xml.find("bathrooms").text();
    newRes.numBed = $xml.find("bedrooms").text();
    
    // Use the user's defined info if present, otherwise use zillow info
    var num_beds = window.userData !== undefined
                && window.userData['NUM_BEDS'] !== undefined ?
                window.userData['NUM_BEDS'] :
                newRes.numBed;

    var num_baths = window.userData !== undefined
                && window.userData['NUM_BATHS'] !== undefined ?
                window.userData['NUM_BATHS'] :
                newRes.numBath;
    
    var sqft = window.userData !== undefined
                && window.userData['SQFT'] !== undefined ?
                window.userData['SQFT'] :
                newRes.sqFt;

    var solar = window.userData !== undefined
                && window.userData['SOLAR'] !== undefined ?
                window.userData['SOLAR'] :
                newRes.solar;

    solar = solar ? "true" : "false";

    //TODO more than sqft
    var params = "?";
    //params += "num_beds=" + num_beds + "&";
    //params += "num_baths=" + num_baths + "&";
    params += "sqft=" + sqft + "";
    //params += "solar=" + solar;

    console.log(params);

    // Calculate and show the user's greenscore
    var getGreenscore = $.parseJSON($.ajax({
      type: 'GET',
      url: 'http://'+ipAddr+':15237/json/getGreenscore'+params,
      async: false
    }).responseText);
    console.log(getGreenscore);
    var greenscore = getGreenscore['result'];

    if(greenscore === undefined) {
      greenscore = "<p>An undefined greenscore indicates that we don't have enough information to provide you with an accurate greenscore. Fill in some of the data below, and we'll calculate it!</p>";
    }

    $("#profileGreenscore_right").html(greenscore);

});

/** @brief Receive api response from server that contains a list of
 *         comparable sales for a specific property
 *
 */
queryHandler.socket.on("compResults", function(data){
    var txt, xmlDoc, xml, zpid, newRes, errorCode;

    txt = data.zillowData;

    xmlDoc = $.parseXML(txt);
    $xml = $(xmlDoc);
    /*
    errorCode = $(xml).find("code").text();
    */
    

    var returned = 0;
    $xml.find("comp").each(function() {
      zpid = $(this).find("zpid").text();
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
	newRes.lotSize = $(this).find("lotSizeSqFt").text();
	newRes.taxAssessment = $(this).find("taxAssessment").text();
        newRes.priceEst = $(this).find("amount").text();
        newRes.numBath = $(this).find("bathrooms").text();
        newRes.numBed = $(this).find("bedrooms").text();

        // get the greenscore pseudo-synrchonously (don't populate map until
        // we get result back but allow ui thread to run)
        $.ajax({
          type: 'GET',
        //  url: 'http://kettle.ubiq.cs.cmu.edu:15237/json/getGreenscore?sqft=' + newRes.sqFt,
          url: 'http://'+ipAddr+':15237/json/getGreenscore?sqft=' + newRes.sqFt,
          async: true
        }).done((function(data) {
          this.greenscore = $.parseJSON(data)['result'];

          Residences.all[this.zpid] = this;
          gMap.newMarker(this);

          returned++;
          check_for_completion();
        }).bind(newRes));
      }

    });
    

    // checks if all elements have reported back
    var check_for_completion = function() {
      if (returned === $xml.find("comp").length) {
        queryHandler.displayResults();
      };
    };
});


/** @brief Receive api response from server that contains
 *         information about a neighborhood
 *
 */
queryHandler.socket.on("demoResults", function(data){
    var txt, xmlDoc, xml;
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

