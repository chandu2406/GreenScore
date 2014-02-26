
	
	function indihouse(ids, hash_value) {
	
	user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
	
	$('#review_options').html('');
	 var reviewop = '';
	 
	 reviewop += '<div class="ui-grid-a"> <div><a type="button" onclick="capturePhoto('+ids+');" data-mini="true" data-theme="b" >Take Pictures </a></div>  </div>';
	 
	
     
	
	$('#review_options').append(reviewop);
	$('#review_options').trigger('create'); 
	$('#factor_list').html('');
	
    $('#factor_list').append('<div data-role-"content" data-role="collapsible"> <h3> Reviews </h3>  <div   id="factor_list_2"> 	</div> <div ><a type="button" onclick = "addreview('+ids+');" data-mini="true" data-theme="b">Add/Edit Reviews</a></div>	</div> ');
	 //  $('#indihouse').trigger('create'); 
	   
	    $('#factor_list').append('<div data-role-"content" data-role="collapsible"> <h3> Notes </h3>  <div> <p> <b>Notes:</b> </br> </p> <p>'+user_data_up.houses[ids].Notes+' </p> 	</div> </br> <div><a  onclick = " takenotes('+ids+');" data-rel="dialog" type="button" data-mini="true" data-theme="b">Take Notes</a></div>	</div> ');
	  // $('#indihouse').trigger('create'); 
	   
	 $('#factor_list').append('<div data-role="collapsible"> <h3> Address </h3> <div><p> '+user_data_up.houses[ids].address.unit+', '+user_data_up.houses[ids].address.street+'</br>'+user_data_up.houses[ids].address.city+', '+user_data_up.houses[ids].address.state+'</br>'+user_data_up.houses[ids].address.country+', '+user_data_up.houses[ids].address.ZIP+'</br> </p> </br> <div><a  onclick = " updateaddress('+ids+');" data-rel="dialog" type="button" data-mini="true" data-theme="b">Update Address</a></div>	</div></div>');	 
	 // $('#indihouse').trigger('create'); 
	  
	   $('#factor_list').append('<div data-role="collapsible"> <h3> Contact(Landlord) </h3> <p> <b>Email:</b> '+user_data_up.houses[ids].contacts.Email+'</br> <b>Phone:</b> '+user_data_up.houses[ids].contacts.Phone + '</p><div><a  onclick = " updatecontact('+ids+');" data-rel="dialog" type="button" data-mini="true" data-theme="b">Update Contact</a>	</div> </div>');
	   $('#indihouse').trigger('create'); 
   
    $('#savenotes').html('');
   	 $('#savenotes').html('<a data-role="button" data-mini="true" data-theme="b" onclick="savenotes('+ids+');">Save</button>');
	  $('#savenotes').trigger('create');
	  
	  $('#saveaddress').html('');
   	 $('#saveaddress').html('<a data-role="button" data-mini="true" data-theme="b" onclick="saveaddress('+ids+');">Save</button>');
	  $('#saveaddress').trigger('create');
	  
	   $('#savecontact').html('');
   	 $('#savecontact').html('<a data-role="button" data-mini="true" data-theme="b" onclick="savecontact('+ids+');">Save</button>');
	  $('#savecontact').trigger('create');
	   
	  
	   
        var obj = user_data_up.houses[ids].factors;
		delete user_data_up.houses[ids].factors.idst;
		var output2='';
		
        for(var key in obj){
            var attrName = key;
            var attrValue = obj[key];
            var type = typeof(attrValue);
            if( type !="object" ) {
						
          output2 += '<p> <b>'+attrName+'</b> : '+attrValue+'  </p>';
				
            }
            else {
            
            }
			
			
        }
		 $('#factor_list_2').html(output2);
    
	 
	var output='';
	
	for (var i = 0; i < user_data_up.houses[ids].pictures.length; i++) {
	    var page_title = user_data_up.houses[ids].label;
		var title = user_data_up.houses[ids].pictures[i].label;
		var link = user_data_up.houses[ids].pictures[i].source;
		var blocktype =
			((i%3)===2) ? 'c':
			((i%3)===1) ? 'b':
			'a';
					output += '<div class="ui-block-' + blocktype + '">';
		output += '<a href="#showphoto" data-rel="dialog" data-transition="fade" onclick="showPhoto(\'' + link +'\',\'' + title + '\')">';
		output += '<img src="' + link + '" alt="' + title + '" />';
		output += '</a>';
		output += '</div>';
	} // go through each photo
	$('#photolist').html(output);
	$('#house_title').text(page_title);
	
	$.mobile.changePage( "#indihouse", {
  transition: "pop",
  reverse: false,
  changeHash: hash_value 
});
} //jsonFlickrFeed


function showPhoto(link, title, hid) {
    $('#photo_label').text(title);
	var output='<a href="#photos" data-transition="fade"> ';
	output += '<img src="' + link + '" alt="' + title +'" />';
	output += '</a>';
	$('#myphoto').html(output);
}

function takenotes(ids) {
$.mobile.changePage( "#notes", {
  transition: "pop",
  reverse: false,
  changeHash: true
});
user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
$('#textareabox').val(user_data_up.houses[ids].Notes);

}

function updateaddress(ids) {
$.mobile.changePage( "#updateadd_page", {
  transition: "pop",
  reverse: false,
  changeHash: true
});
user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
$('#unit_up').val(user_data_up.houses[ids].address.unit);
$('#street_up').val(user_data_up.houses[ids].address.street);
$('#city_up').val(user_data_up.houses[ids].address.city);
$('#state_up').val(user_data_up.houses[ids].address.state);
$('#country_up').val(user_data_up.houses[ids].address.country);
$('#zip_up').val(user_data_up.houses[ids].address.ZIP);
$('#house_label_up').val(user_data_up.houses[ids].label);


}

function saveaddress(ids) {
   var obj = ($('form[name=update_address_form]').serializeObject());
   console.log(obj);
   
    user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
	user_data_up.houses[ids].address.unit = $("#unit_up").val();
	user_data_up.houses[ids].address.street =$("#street_up").val();
	user_data_up.houses[ids].address.state = $("#state_up").val();
	user_data_up.houses[ids].label = $("#house_label_up").val();
	//user_data_up.houses[ids].address.label = obj.house_label_up;
	user_data_up.houses[ids].address.ZIP = $("#zip_up").val();
	user_data_up.houses[ids].address.city = $("#city_up").val();
	
	$.post("http://128.2.207.3:5000/houses/address"+ "?auth_token=" +user_data_up.token, $('form[name=update_address_form]').serialize() + "&house%5Bhouse_id%5D="+ids, function(json) {
      
	  //alert(json.success);
	  
	  
	  });
	 
	localStorage.setItem("user_data_ls", JSON.stringify(user_data_up));
	indihouse(ids, false);


}

function savecontact(ids) {
   
    var obj = ($('form[name=update_contact_form]').serializeObject());
   console.log(obj);
	 user_data_up.houses[ids].contacts.Email =  obj.email;  
     user_data_up.houses[ids].contacts.Phone =  obj.phone; 	 
	 
	 $.post("http://128.2.207.3:5000/houses/contact" + "?auth_token=" +user_data_up.token, "&house%5Bhouse_id%5D="+ids + "&house%5Bphone%5D="+obj.phone + "&house%5Bemail%5D="+obj.email, function(json) {
      
	  //alert(json.success);
	  
	  
	  });
	 
	localStorage.setItem("user_data_ls", JSON.stringify(user_data_up));
	
  indihouse(ids, false);


}
function savenotes(ids) {
   
    user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
	//alert($('textarea').val());
	 user_data_up.houses[ids].Notes = $('textarea').val();     
	 $.post("http://128.2.207.3:5000/houses/notes" + "?auth_token=" +user_data_up.token, "&house%5Bhouse_id%5D="+ids + "&house%5BNotes%5D="+user_data_up.houses[ids].Notes , function(json) {
      
	//  alert(json.success);
	  
	  
	  });
	localStorage.setItem("user_data_ls", JSON.stringify(user_data_up));
	indihouse(ids, false);


}
function updatecontact(ids) {

$.mobile.changePage( "#updatecontact_page", {
  transition: "pop",
  reverse: false,
  changeHash: true
});
 user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
$('#email').val(user_data_up.houses[ids].contacts.Email);
$('#phone').val(user_data_up.houses[ids].contacts.Phone);




}

function addreview(ids) {

$.mobile.changePage( "#reviewhomesform", {
  transition: "pop",
  reverse: false,
  changeHash: false
});
$('#savereview').html('');
$('#formids').remove();

	$('#savereview').append(' <input type="submit"   data-theme="b"   value="Save when Done"/>');
	var input = $("<input>").attr("type", "hidden").attr("name", "idst").attr("id", "formids").val(ids);
$('form[name=review_form]').append($(input));

	$('#savereview').trigger('create');
	user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
	delete user_data_up.houses[ids].factors.idst;
	var obj = user_data_up.houses[ids].factors;
	$('#addMoreButtons').html('');
	 for(var key in obj){
	 var thediv = $('#addMoreButtons');
            var attrName = key;
            var attrValue = obj[key];
            var type = typeof(attrValue);
            if( type !="object" ) {
						
          thediv.append('<div id="'+attrName+ '"data-role="header" class="ui-header ui-bar-a" role="banner"><a href="#"  onclick="removeel('+"'#"+attrName+"'"+ ')"data-icon="delete" class="ui-btn-right ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-left" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="a"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">Cancel</span><span class="ui-icon ui-icon-delete ui-icon-shadow">&nbsp;</span></span></a><h3 class="ui-title" role="heading" aria-level="1">'+attrName+'</h3> <input data-theme="c" type="text" name="'+attrName+'" id="" value="'+attrValue+'" /> </div>');
       
        $('#reviewhomesform').trigger('create'); 
				
            }
			}
	
	
	
	
user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
$('#textareabox').val(user_data_up.houses[ids].Notes);

}

function savereview(ids) {



}