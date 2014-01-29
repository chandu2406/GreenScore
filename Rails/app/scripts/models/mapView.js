/** @file mapView.js
 *  @brief model of the map object
 *
 *  @author Kenneth Murphy (kmmurphy)
 *  @author Lucas Ray (ltray)
 */

var gMap = {};
//globals to hold the map and infowindow
gMap.map;
gMap.infoWindow;

gMap.Marker = function(){
    this.latLong;
    this.address;
    this.residence;
    //marker object returned by Google API
    this.gMarker;
}
//array of marker objects defined above
gMap.newMarkers = [];
//array of google map initialized markers
gMap.markers = [];
//google map marker currently opened
gMap.open_marker = undefined;


/** @brief Initializes a event handler to load the google map the first time
 *  the page is shown, and add markers to the map
 *
 *  @param residence- information retrieved from the zillow API that the
 *         user entered
 *
 */
gMap.init = function(residence){

  var mapOptions = {
    center: new google.maps.LatLng(residence.lat, residence.long),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  gMap.newMarker(residence);

  $("#mapView").on("pageshow", function() {
  // if the div holding the map is empty, initialize the map
    if ($("#map_canvas").children().length === 0) {
        gMap.infoWindow = new google.maps.InfoWindow();
        gMap.map = new google.maps.Map(document.getElementById("map_canvas"),
                                       mapOptions);
    }

    // initialize all new markers on the page
    gMap.initMarkers();
  });
}

/** @brief Function called to retrieve info from Zillow API for a single address
 *
 *  @param addr-a userAddress object to retrieve information on
 *
 */
gMap.updateCoors = function (lat, long) {
   console.log("updating center of map coordinates");
    var latLong = new google.maps.LatLng(lat, long);
    gMap.map.setCenter(latLong);
}

/** @brief Creates a new marker object and adds it to an array of markers that
 *         will be created on the next pageshow event
 *
 *  @param residence - info about where to place the marker and what data will be associated with it
 *
 */
gMap.newMarker = function(residence){
    var marker;
    //create a new marker object as defined above
    marker = new gMap.Marker();
    marker.latLong = new google.maps.LatLng(residence.lat, residence.long);
    marker.addr = residence.street+", "+residence.city+" "+residence.state+
  ", "+residence.zipcode;
    marker.residence = residence;
    //add it to the newMarker array to be initialized on pageshow
    gMap.newMarkers.push(marker);
}


/** @brief Function to initialize markers on the map on pageshow
 *
 */
gMap.initMarkers = function() {
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

  gMap.attachData(newMarker, marker.residence);

        marker.gMarker = newMarker;
        gMap.markers.push(marker);
    }
    gMap.newMarkers = [];
}


/** @brief attaches info about a residence to a marker so that when clicked,
 *         the marker will display the information in an attractive format
 *
 *  @param marker- newly ititialized marker on which to attach an event
 *         handler to display data
 *
 *  @param residence- the residence data to associate with that marker.
 */
gMap.attachData = function(marker, data) {
  var content, child, header, stats, results, footer, i;

  content = document.createElement('div');
  content.setAttribute('class', 'marker_div');

  header_tags  = ['street', 'zipcode', 'state', 'city'];
  stats_tags   = ['numBed', 'sqFt', 'numBath'];
  results_tags = ['priceEst', 'greenscore'];

  // add the header
  header = document.createElement('div');
  header.setAttribute('class', 'marker_header');
  for (i = 0; i < header_tags.length; i++) {
    prop = header_tags[i];
    child = document.createElement('div');
    child.setAttribute('class', 'marker_child child_' + prop);

    // add the data
    text = data[prop];

    // suffixes
    switch(prop) {
      case 'city':
        text += ', ';
        break;
      case 'state':
        text += ', ';
        break;
      default:
        break;
    };

    child.innerHTML = text;
    header.appendChild(child);

    // adding newlines
    if ((prop === 'street') ||
        (prop === 'city')) {
      header.appendChild($('<br>')[0]);
    };
  };

  // add the stats
  stats = document.createElement('div');
  stats.setAttribute('class', 'marker_stats');
  for (i = 0; i < stats_tags.length; i++) {
    prop = stats_tags[i];
    child = document.createElement('div');
    child.setAttribute('class', 'marker_child child_' + prop);
    text = "";

    // content
    text += data[prop];

    // suffixes
    switch(prop) {
      case 'sqFt':
        text += ' sqft';
        break;
      case 'numBed':
        text += ' beds';
        break;
      case 'numBath':
        text += ' baths';
        break;
      default:
        break;
    };
    child.innerHTML = text;
    stats.appendChild(child);

    // adding newlines
    if (prop === 'sqFt') {
      stats.appendChild($('<br>')[0]);
    };
  };

  // add the results
  results = document.createElement('div');
  results.setAttribute('class', 'marker_results');
  for (i = 0; i < results_tags.length; i++) {
    prop = results_tags[i];
    child = document.createElement('div');
    child.setAttribute('class', 'marker_child child_' + prop);
    text = "";

    // prefixes
    switch(prop) {
      case 'priceEst':
        text += '$';
        break;
      case 'greenscore':
        text += 'GS: ';
        break;
      default:
        break;
    };

    // content
    text += data[prop];

    child.innerHTML = text;
    results.appendChild(child);

    // adding newlines
    if (prop === 'greenscore') {
      stats.appendChild($('<br>')[0]);
    };
  };

  // add the footer
  footer = document.createElement('div');
  footer.setAttribute('class', 'marker_footer');
  
  moreInfo = document.createElement('div');
  moreInfo.setAttribute('class', 'moreInfoBtn');
  moreInfo.innerHTML = "More Information";
  footer.appendChild(moreInfo);

  //attach click handler to pull up propView page with more property information 
  moreInfo.addEventListener("click", function(){
      gMap.displayInformation(data);
  });

  content.appendChild(header);
  content.appendChild($('<hr>')[0]);
  content.appendChild(stats);
  content.appendChild($('<hr>')[0]);
  content.appendChild(results);
  content.appendChild(footer);

  var bubble = new InfoBubble({
    'backgroundColor': "rgb(75, 74, 75)",
    'borderColor': "rgb(45, 44, 44)",
    'borderRadius': "8",
    'borderWidth': "2",
    'padding': "5",
    'minWidth': "200",
    'maxWidth': "400",
    'minHeight': "130",
    'maxHeight': "350",
    'shadowStyle': "1",
    'arrowSize': "15",
    'arrowPosition': "5",
    'arrowStyle': "2",
    'disableAnimation': true,

    'content': content
  });

  google.maps.event.addListener(marker, 'click', function() {
    if (bubble.isOpen() === false) {
      // close existing markers
      if (gMap.open_marker !== undefined) {
        gMap.open_marker.close();
      };

      bubble.open(gMap.map, marker);
      gMap.open_marker = bubble;
    };
  });
}



gMap.displayInformation = function(data){
    var text, prop, header_tags, stats_tags, domIds, i, child;


    address_comp  = ['street','city','state','zipcode'];
    stats_tags = ['lat','long','numBed','numBath','sqFoot','lotSize','taxAssessment',
		  'priceEst','greenscore'];
    stats_titles = ['Longitude: ','Latitude: ','Number of Beds: ', 'Number of Baths: ',
		    'Square Feet: ','Lot Size: ', 'Tax Assessment: $','Price Estimate: $', 
		    'Greenscore: '];
    domIds = ['propLong','propLat','propSqFt','propLotSize','propTaxAssess','propNumBed',
	      'propNumBath','propPriceEst','propGS'];

    text="";
    for (i = 0; i < address_comp.length; i++) {
	prop = address_comp[i];
	
	// add the data
	text += data[prop];

	// suffixes
	switch(prop) {
	case 'street':
            text += ', ';
            break;
	case 'city':
            text += ', ';
            break;
	default:
	    text += " ";
            break;
	};
    }
    child = $("<h2></h2>");
    child.html("Address: <span>"+text+"</span>");

    $("#propAddr").append(child);
    
    for(i=0; i< stats_tags.length; i++){
	prop = stats_tags[i];
	child = $("<h2></h2>");

	text = stats_titles[i];
	if(typeof data[prop] !== 'undefined'){
	    text += "<span>"+data[prop]+"</span>";
	    child.html(text);
	    $("#"+domIds[i]).append(child);
	}
    }
    

    $.mobile.changePage($("#propView"), { transition: "slideup"} );

}
