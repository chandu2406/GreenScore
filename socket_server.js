// Generated by CoffeeScript 1.3.3

/*
@file socket_server.coffee

@brief Our socket server implementation.
@author Kenneth Murphy (kmmurphy)
@author Lucas Ray (ltray)
*/


(function() {
  var SocketServer;

  SocketServer = (function() {

    function SocketServer(port) {
      this.port = port;
      /*
          @brief Constructor for this socket server.
      
          @param port The port we're listening on.
      */

    }

    SocketServer.prototype.listen = function() {
      /*
          @brief Starts this server listening.
      */

      var http, io;
      io = require('socket.io').listen(this.port);
      http = require("http");
      return io.sockets.on('connection', (function(socket) {
        return socket.on('simpleSearch', (function(data) {
          var options, processZillowData;
          console.log("beginning simple search");
          options = {
            host: 'www.zillow.com',
            path: data.path,
            method: 'GET'
          };
          processZillowData = (function(res) {
            var zillowXML;
            zillowXML = '';
            res.on('data', (function(zillowData) {
              return zillowXML += zillowData;
            }));
            res.on('end', (function() {
              return socket.emit('searchResults', {
                'zillowData': zillowXML
              });
            }));
            return res.on('error', (function(err) {
              return console.log(err);
            }));
          });
          return (http.request(options, processZillowData)).end();
        }));
      }));
    };

    return SocketServer;

  })();

  module.exports = SocketServer;

}).call(this);
