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

/** @brief Function called to retrieve info from Zillow API
   */
zillowHandler.queryZillow = function(addr){
  var urlAddr, path;

  //url format the address by replacing all spaces with pluses in the route
  urlAddr = addr.streetNum+"+"+addr.street.split(" ").join("+");
  //return a path to the api query that will appended to the zillow domain name
  path = "/webservice/GetDeepSearchResults.htm?zws-id="+zillowHandler.ZWSID+"&address="+urlAddr+"&citystatezip="+addr.zipcode;

  //send the url to the server.  The server will query the API and return the response.
  zillowHandler.socket.emit("send", {'path': path});
}

/** @brief receive api response from server and parses the response
   * the resulting information is then sent to the mapView
   */
zillowHandler.socket.on("receive", function(data){
  var txt, xmlDoc, xml, zillowData;

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
  var prop;

  for (prop in results){
  console.log(""+prop+": "+results[prop]);
  }

  mapInit(results);
}




