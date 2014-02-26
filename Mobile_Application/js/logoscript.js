
//function to load the login screen screen 
function foo() {
setTimeout("window.location.replace('login.html')","1000");	
}

function anchor(address){
	window.location.href= address;
}





function login() {

//send it to rails app
//wait for response
//save cookies
//go to home page
// var t = document.getElementById('email').value;
// t= "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=bank&sensor=false&key=AIzaSyD3rfAv2pL6ZNxU6MQjcFCUpZR1fZu3f0E";
// xmlrequest(t);

console.log("entered login");
//document.getElementById('error1').style.display = 'block';
xmlrequest();
//window.location.href="home.html";

}

function forgotpass() {
window.location.href="password_retrieval.html";
window.console.log("entered forgot");
}



function xmlrequest() {
console.log("entered xmlrequest");
var request;
if (window.XMLHttpRequest) {
	request = new XMLHttpRequest();
} else {
	request = new ActiveXObject("Microsoft.XMLHTTP");
}

request.open('POST', 'https://api.twitter.com/1.1/statuses/mentions_timeline.json');
request.onreadystatechange = function() {
	if ((request.readyState===4) && (request.status===200)) {
		//var items = JSON.parse(request.responseText);	
		console.log("onreadystatechange");	
		document.writeln(request.responseText);

	}
	else {
		console.log("did not enter onreadystatechange")
	}
}
request.send();

}

