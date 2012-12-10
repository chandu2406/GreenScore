/** @file filters.js
 *  @brief controller to manipulate the residences displayed on the map
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

var filter = {};

/** @brief Filters markers present on the map by price.
 *
 */
filter.byPrice = function() {
    var min, max, markerPrice;

    min = $("#priceMin").val();
    max = $("#priceMax").val();

    if(min === ""){
        alert("please an a minimum price");
        $("#minPrice").css("background-color", "#ff0000");
    }else if(max === ""){
        alert("please an a maximum price");
        $("#maxPrice").css("background-color", "#ff0000");
    }else{
        min = parseInt(min);
        max = parseInt(max);
        console.log("max and min are:" + max + " " + min);

        for(i=0; i<gMap.markers.length; i++){
            markerPrice = parseInt(gMap.markers[i].residence.priceEst);
            console.log(markerPrice);
            if(markerPrice > max || markerPrice < min){
                console.log("removing marker: "+gMap.markers[i]);
                gMap.markers[i].gMarker.setMap(null);
            }else{
                console.log("setting map");
                gMap.markers[i].gMarker.setMap(gMap.map);
            }
        }
    }

}

/** @brief Filters markers present on the map by number of bathrooms
 *
 */
filter.byNumBath = function(){
    console.log("filtering by number of baths");
    var numBath;

    numBath = parseFloat($("#numBath").val());
    console.log("numBath: "+numBath);

    for(i=0; i<gMap.markers.length; i++){
        if(numBath !== parseFloat(gMap.markers[i].residence.numBath)){
            console.log("removing marker: "+gMap.markers[i]);
            gMap.markers[i].gMarker.setMap(null);
        }else{
            console.log("setting map");
            gMap.markers[i].gMarker.setMap(gMap.map);
        }
    }
}

/** @brief Filters markers present on the map by number of bedrooms
 *
 */
filter.byNumBed = function(){
    var numBed;
    numBed = parseFloat($("#numBed").val());

    for(i=0; i<gMap.markers.length; i++){
        if(numBed !== parseFloat(gMap.markers[i].residence.numBed)){
            console.log("removing marker: "+gMap.markers[i]);
            gMap.markers[i].gMarker.setMap(null);
        }else{
            console.log("setting map");
            gMap.markers[i].gMarker.setMap(gMap.map);
        }
    }
}


