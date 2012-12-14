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
    console.log("filtering by price");
    min = parseInt($("#priceMin").val());
    max = parseInt($("#priceMax").val());
    
    for(i=0; i<gMap.markers.length; i++){
        markerPrice = parseInt(gMap.markers[i].residence.priceEst);

        if(markerPrice > max || markerPrice < min){
            gMap.markers[i].gMarker.setMap(null);
        }else{
            gMap.markers[i].gMarker.setMap(gMap.map);
        }
    }   
}

/** @brief Filters markers present on the map by number of bathrooms
 *
 */
filter.byNumBath = function(){
    console.log("filtering by number of baths");
    var numBath, min, max;

    min = parseFloat($("#bathMin").val());
    max = parseFloat($("#bathMax").val());

    for(i=0; i<gMap.markers.length; i++){
        numBath = parseFloat(gMap.markers[i].residence.numBath);
        if(numBath < min || numBath > max ){
            gMap.markers[i].gMarker.setMap(null);
        }else{
            gMap.markers[i].gMarker.setMap(gMap.map);
        }
    }
}

/** @brief Filters markers present on the map by number of bedrooms
 *
 */
filter.byNumBed = function(){
    console.log("filtering by number of beds");
    var numBed, min, max;

    min = parseFloat($("#bedMin").val());
    max = parseFloat($("#bedMax").val());

    for(i=0; i<gMap.markers.length; i++){
        numBath = parseFloat(gMap.markers[i].residence.numBed);
        if(numBed < min || numBed > max ){
            gMap.markers[i].gMarker.setMap(null);
        }else{
            gMap.markers[i].gMarker.setMap(gMap.map);
        }
    }
}

/** @brief Filters markers present on the map by their greenscore
 *
 */
filter.byGreenscore = function(){
    console.log("filtering by number of greenscore");
    var greenscore, minGS, maxGS;

    minGS = parseFloat($("#gsMin").val());
    maxGS = parseFloat($("#gsMax").val());

    for(i=0; i<gMap.markers.length; i++){
        greenscore = parseFloat(gMap.markers[i].residence.greenscore);
        if(greenscore < minGS || greenscore > maxGS ){
            gMap.markers[i].gMarker.setMap(null);
        }else{
            gMap.markers[i].gMarker.setMap(gMap.map);
        }
    }
}

/** @brief Filters markers present on the map by their greenscore
 *
 */
filter.attachFilters = function(){
   
    $("#priceMin, #priceMax").on("slidestop", function(){    
        $("#filterMsg").attr("class", "showMsg");
        
        //make sure min doesn't exceed max
        var min, max;
        min = parseFloat($("#priceMin").val());
        max = parseFloat($("#priceMax").val());
        if(min > max){
           if($(this).attr("id")==="priceMax"){
               $(this).val(min);  
           }else{
               $(this).val(max);
           }
           $(this).slider("refresh");
        }
        filter.byPrice();
        setTimeout("$('#filterMsg').attr('class', 'noMsg');", 1500);
     });
    $("#bathMin, #bathMax").on("slidestop", function(){
        $("#filterMsg").attr("class", "showMsg");
        //make sure min doesn't exceed max
        var min, max;
        min = parseFloat($("#bathMin").val());
        max = parseFloat($("#bathMax").val());
        if(min > max){
           if($(this).attr("id")==="bathMax"){
               $(this).val(min);  
           }else{
               $(this).val(max);
           }
           $(this).slider("refresh");
        }
        filter.byNumBath();
        setTimeout("$('#filterMsg').attr('class', 'noMsg');", 1500);
     });
    $("#bedMin, #bedMax").on("slidestop", function(){
        $("#filterMsg").attr("class", "showMsg");
        //make sure min doesn't exceed max
        var min, max;
        min = parseFloat($("#bedMin").val());
        max = parseFloat($("#bathMax").val());
        if(min > max){
           if($(this).attr("id")==="bathMax"){
               $(this).val(min);  
           }else{
               $(this).val(max);
           }
           $(this).slider("refresh");
        }
        filter.byNumBed();
        setTimeout("$('#filterMsg').attr('class', 'noMsg');", 1500);
     });
    $("#gsMin, #gsMax").on("slidestop", function(){
        $("#filterMsg").attr("class", "showMsg");
        //make sure min doesn't exceed max
        var min, max;
        min = parseFloat($("#gsMin").val());
        max = parseFloat($("#gsMax").val());
        if(min > max){
           if($(this).attr("id")==="gsMax"){
               $(this).val(min);  
           }else{
               $(this).val(max);
           }
           $(this).slider("refresh");
        }
        filter.byGreenscore();
        setTimeout("$('#filterMsg').attr('class', 'noMsg');", 1500);
     });
}

