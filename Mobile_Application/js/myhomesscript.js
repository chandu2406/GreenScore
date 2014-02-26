    
	function listhomes(hash_value) {
	$.mobile.changePage( "#myhomes", {
  transition: "slide",
  reverse: false,
  changeHash: hash_value
});
	
	var thediv2 = $('#add_labels');
	thediv2.html('');
	user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
	$.each(user_data_up.houses, function(i, v) {
       thediv2.append('<div data-role="collapsible"> <h3>'+user_data_up.houses[i].label+' </h3>  '+user_data_up.houses[i].address.unit+', '+user_data_up.houses[i].address.street+'</br>'+user_data_up.houses[i].address.city+', '+user_data_up.houses[i].address.state+'</br>'+user_data_up.houses[i].address.country+', '+user_data_up.houses[i].address.ZIP+'</br><button data-mini="true" onclick="indihouse('+user_data_up.houses[i].id+', true);">View More</button> <img style="display:none;width:100px;height:100px;" class="'+user_data_up.houses[i].label+'" src='+user_data_up.houses[i].pictures[0].source+' /></div><!-- collapsible -->');
        
        $('#add_labels').trigger('create'); 
        
    });
	
	}
	
	
	
 
     
		
  

 

	