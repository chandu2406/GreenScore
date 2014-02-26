$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
$( document ).bind( 'mobileinit', function(){
  $.mobile.loader.prototype.options.text = "loading";
  $.mobile.loader.prototype.options.textVisible = false;
  $.mobile.loader.prototype.options.theme = "a";
  $.mobile.loader.prototype.options.html = "";
});
$(document).on( "click", ".show-page-loading-msg", function() {
  var $this = $( this ),
  theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
  msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
  textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
  textonly = !!$this.jqmData( "textonly" );
  html = $this.jqmData( "html" ) || "";
$.mobile.loading( 'show', {
  text: msgText,
  textVisible: textVisible,
  theme: theme,
  textonly: textonly,
  html: html
  });
})
.on( "click", ".hide-page-loading-msg", function() {
  $.mobile.loading( "hide" );
});

function signincheck() {

//alert("signincheck");
//var user_data_up = JSON.parse(localStorage.getItem("user_data_ls"));

if ( localStorage.getItem("user_data_ls") == null ) { 

//alert("user_data not present"); 
move_to_page_false('#signin');
location.hash = "#signin";
}
//alert("signin token = " + user_data_up.token );
else{
var user_data_up = JSON.parse(localStorage.getItem("user_data_ls"));

if(user_data_up.token == null) { 
//alert("token is null");
move_to_page_false('#signin');
}
else {
//alert("token present = "+ user_data_up.token);

move_to_page_false('#myhomes');
location.hash = "#myhomes";
listhomes(false);
}


} 



}

function move_to_page_false(page) {

$.mobile.changePage( page, {
  transition: "pop",
  reverse: false,
  changeHash: false
});


}

function move_to_page_true(page) {

$.mobile.changePage( page, {
  transition: "pop",
  reverse: false,
  changeHash: true
});


}


 






$(function() {
    $('form[name=review_form]').submit(function() {
       
		var obj = ($('form[name=review_form]').serializeObject());
		console.log(obj);
		
		
		
	user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
	user_data_up.houses[obj.idst].factors = obj;
	var idst_new = obj.idst;
	
	delete user_data_up.houses[obj.idst].factors.idst;
	var factor_send = JSON.stringify(user_data_up.houses[idst_new].factors);
	
	$.post("http://128.2.207.3:5000/reviews" + "?auth_token=" +user_data_up.token, "&house%5Bhouse_id%5D="+idst_new + "&house%5Bhouse_factors%5D="+factor_send, function(json) {
      
	  //alert(json.success);
	  
	  
	  });
	user_data_up.houses[idst_new].factors.idst = idst_new;  
	  
			localStorage.setItem("user_data_ls", JSON.stringify(user_data_up));
		 indihouse(obj.idst, false);

        return false;
    });
});



$(function() {
    $('form[name=address_form]').submit(function() {
	
	
        var address_data = $('form[name=address_form]').serializeObject();
		
		user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
		house_num = user_data_up.houses.length;
		var new_house = { 
	"id" : house_num,
	"label" : $('#house_label').val(),
	"Notes" : "",
	"address" : 
	   {
	"country" : $('#country').val() , 
	"city" : $('#city').val(), 
	"state" : $('#state').val(), 
	"street" : $('#street').val() ,
	"unit" : $('#unit').val(), 
	"ZIP" : $('#zip').val()
		},
	"factors" : {
	
	"Sunlight" : "Not reviewd",
	"Ventilation" : "Not Reviewed",
	"Mold" : "Not Reviewed",
	"Parking" : "Not Reviewed",
	"Electrcity" : "Not Reviewed",
	"Lead" :  "Not Reviewed",
    	
      	
	
	},
	
	"contacts" : {
	 "Email" : "example@example.com",
	 "Phone" : 12345678 
	
	},
     
	"pictures": [ 
	{
	"id" : 0,
	"label" : "picture 0" ,
	"source": "images/home.jpg"
	}
    
	]
	
	}; 
	//alert($(this).attr('action') + "?auth_token=" +user_data_up.token);
	//alert(house_num);
	$.post($(this).attr('action') + "?auth_token=" +user_data_up.token, $(this).serialize() + "&house%5Bhouse_id%5D="+house_num , function(json) {
      
	  //alert(json.success);
	  
	  
	  });
	console.log(new_house);
	user_data_up.houses[house_num] = new_house;
			localStorage.setItem("user_data_ls", JSON.stringify(user_data_up));
		
listhomes(false);
	
        return false;
    });
	
	
});



 $(function(){
  $('form[name=signin_form]').submit(function(){
  	//alert($(this).attr('action'));
    $.post($(this).attr('action'), $(this).serialize(), function(json) {
	//alert("hello");
	var err = '' ;
	if(json.token != null && json.success=== undefined) {
		if (localStorage.getItem("user_data_ls") === null) {
	  
		localStorage.setItem("user_data_ls", JSON.stringify(user_data));
		user_data_up = JSON.parse(localStorage.getItem("user_data_ls"));
		user_data_up.token = json.token;
		localStorage.setItem("user_data_ls", JSON.stringify(user_data_up));
		$.mobile.loading( "hide" );
		alert("Login Successful");
		move_to_page_false('#myhomes');
		location.hash = "#myhomes";
	}  
	else {
	
	$.mobile.loading( "hide" );
	alert("Login Successful");
		move_to_page_false('#myhomes');
		location.hash = "#myhomes";
	
		
	}
	
	}
	
	if(json.success == "false"){
	
	for (var i = 0; i < json.errors.length; i++) {
   err += json.errors[i] + "\n";
   
}
	$.mobile.loading( "hide" );
	alert("Following Errors occoured: \n" + err);
	
	}
	
	
	  
    }, 'json').done(function() { 
	//alert("second success");
	})
.fail( function(xhr, textStatus, errorThrown) {
        //alert("Could not connect to internet");
		alert("Opps..something went wrong. Try Again" + errorThrown);
    });

    return false;
  });
});

 $(function(){
  $('form[name=signup_form]').submit(function(){
  //	alert($(this).attr('action'));
    $.post($(this).attr('action'), $(this).serialize(), function(json) {
	   //$('#loading').css("display", "block");
       var errormsg = '';
	  if(json.token === undefined ) {
	  
	  if(json.email != undefined) { errormsg += "Email " + json.email}
	  errormsg += '\n';
	  if(json.password != undefined) {errormsg += "Password " + json.password}
	   errormsg += '\n';
	  if( json.password_confirmation != undefined) { errormsg += "Password "+ json.password_confirmation}
	  $.mobile.loading( "hide" );
	  alert("Following errors occoured \n" +errormsg);
	  
	  }
	 if(json.token != undefined) {if (localStorage.getItem("user_data_ls") === null) {
	  
	  localStorage.setItem("user_data_ls", JSON.stringify(user_data));
	  user_data_up = JSON.parse(localStorage.getItem("user_data_ls"));
	  user_data_up.token = json.token;
	  localStorage.setItem("user_data_ls", JSON.stringify(user_data_up));
	  $.mobile.loading( "hide" );
  alert("Sign Up Successful");
 move_to_page_false('#myhome');
 location.hash = "#myhome";
 listhomes(false);
	}  
	  
	  }
	  
    }, 'json').done(function() { 
	
	//alert("second success"); 
	
	})
.fail( function(xhr, textStatus, errorThrown) {
//$.mobile.loading( "hide" );
        //alert("Could not connect to internet");
		$.mobile.loading( "hide" );
		alert("Oops..There was some error in signing up. Please try again." + errorThrown);
    });

    return false;
  });
});


document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is loaded and it is now safe to make calls Cordova methods
    //
    
	
	 

    function checkConnection() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';

        return states[networkState];
    }

	
	

    var pictureSource;   // picture source
    var destinationType; // sets the format of returned value 

    // Wait for Cordova to connect with the device
    //
   function onDeviceReady() {
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;
		
    }

    // Cordova is ready to be used!
    //
    

    // Called when a photo is successfully retrieved
    //
    function onPhotoDataSuccess(imageData) {
      // Uncomment to view the base64 encoded image data
      // console.log(imageData);

      // Get image handle
      //
      var smallImage = document.getElementById('smallImage');

      // Unhide image elements
      //
      smallImage.style.display = 'block';

      // Show the captured photo
      // The inline CSS rules are used to resize the image
      //
      smallImage.src = "data:image/jpeg;base64," + imageData;
    }

    // Called when a photo is successfully retrieved
    //
    

    // A button will call this function
    
   function capturePhoto(ids) {
   
      // Take picture using device camera and retrieve image as base64-encoded string
      navigator.camera.getPicture(function onPhotoURISuccess(imageURI) {
      
   

      
    

   //   picture.src = imageURI;
  // alert(ids);
	// alert(imageURI);
	 user_data_up= JSON.parse(localStorage.getItem("user_data_ls"));
	 var num_pics = user_data_up.houses[ids].pictures.length; 
     user_data_up.houses[ids].pictures[num_pics] = 
	                                       {"id" : num_pics,
                                           "label": "picture "+ num_pics,
										"source" : imageURI
										   };
	
	localStorage.setItem("user_data_ls", JSON.stringify(user_data_up));
	indihouse(ids, false);
    
	
    }, onFail, { quality: 50,
        destinationType: destinationType.FILE_URI });
    }
	

    // A button will call this function
    //
    function capturePhotoEdit() {
      // Take picture using device camera, allow edit, and retrieve image as base64-encoded string  
      navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 20, allowEdit: true,
        destinationType: destinationType.FILE_URI });
    }

    // A button will call this function
    //
    function getPhoto(source) {
      // Retrieve image file location from specified source
      navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
        destinationType: destinationType.FILE_URI,
        sourceType: source });
    }

    // Called if something bad happens.
    // 
    function onFail(message) {
      alert('Failed because: ' + message);
    }

	
	$('#addButtonName').click(function() {
    var theFooter = $('#addMoreButtons');
    var buttonName= $('#newButtonName');
    
    if(buttonName.val() != '') {
        theFooter.append('<a href="#" data-role="button" data-icon="delete">'+buttonName.val()+'</a>');
        buttonName.val('');
        $('#theHomePage').trigger('create');  
    }
});



