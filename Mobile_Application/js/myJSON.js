
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

var user_data = {
 "token": null,
  "houses" : [ 
  
	{ 
	"id" : 0,
	"label" : "Demo House",
	"Notes" : "Add Notes Here",
	"address" : 
	   {
	"country" : "USA" , 
	"city" : "Pittsburgh", 
	"state" : "PA", 
	"street" : "Forbes Avenue" ,
	"unit" : 5000, 
	"ZIP" : "15213"
		},
	"factors" : {
	
	"Sunlight" : "Good",
	"Ventilation" : "Good",
	"Mold" : "Not Present",
	"Parking" : "Ample",
	"Electrcity" : "$500/mon",
	"Lead" :  "Not Present",
    	
      	
	
	},
	
	"contacts" : {
	 "Email" : "email@xyz.com",
	 "Phone" : 12345678 
	
	},
     
	"pictures": [ 
	{
	"id" : 0,
	"label" : "picture 0" ,
	"source": "images/home.jpg"
	}
   
	]
	
	}
	]
	
	
};

/*$(function() {
    $('form[name=factorform]').submit(function() {
        var jsondata = $('form[name=factorform]').serializeObject();
		localStorage.setItem('factor', JSON.stringify(jsondata));

	
        return false;
    });
});*/






//alert(user_data_up.houses[0].country);
