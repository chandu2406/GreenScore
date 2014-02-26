document.writeln("entering");
var xhr= new XMLHttpRequest(); 
//true is for asynchronous, false is for synchronous 
xhr.open("GET", "http://www.google.com", true); 

xhr.onreadystatechange = function(){ 
if (xhr.readyState == 4){ 
if(xhr.status != 200){ 
//do something 
document.getElementById('cms-2').style.display = 'block';
} 
else{ 
result = xhr.responseText; 
document.getElementById('cms-1').style.display = 'block';
} 
} 
}
xhr.send(); 
