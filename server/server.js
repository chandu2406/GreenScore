/** @file server.js
 *  @brief An express server that serves pages and communicates with
 *         clients through socket.io
 *
 *  @author Kenneth Murphy (kmmurphy)
 */

//required Node modules
var express = require("express");
var http = require("http");

var app = express();

app.configure(function(){
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'change me!' }));
  app.use(app.router);
});

var wwwDir = "__dirname/../app";
app.use("/", express.static(__dirname + wwwDir));
app.get("/", function(req, res) { res.render(wwwDir + "/index.html");});

app.listen(8080);

/* set up the socket.io library */
var io = require('socket.io').listen(3000);

// Listen for client connection event
io.sockets.on('connection', function(socket){
  //make an HTTP request to a URL sent by the client and sent back the xml response
  socket.on('send', function(data) {
    var options = {
      host: "www.zillow.com",
      path: data.path,
      method: 'GET'
    };
    var processZillowData = function(res){
      var zillowXML = "";
      //keep track of data received
      res.on('data', function(zillowData){
        zillowXML += zillowData+"\n";
      });
      //on end send the data to the client
      res.on('end', function(){
        socket.emit('receive', {"zillowData": zillowXML})
      });
      res.on('error', function(err){
        console.log(err);
      });
    };
    http.request(options, processZillowData).end();
  });
});

