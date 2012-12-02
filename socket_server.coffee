###
@file socket_server.coffee

@brief Our socket server implementation.
@author Kenneth Murphy (kmmurphy)
@author Lucas Ray (ltray)
###

class SocketServer
  constructor: (@port) ->
    ###
    @brief Constructor for this socket server.

    @param port The port we're listening on.
    ###

  listen: () ->
    ###
    @brief Starts this server listening.
    ###
    io = require('socket.io').listen(@port)

    # Listen for client connection event
    io.sockets.on 'connection', ((socket) ->
      # make an HTTP request to a URL sent by the client and send back the xml
      # response
      socket.on 'send', ((data) ->
        options = {
          host: 'www.zillow.com',
          path: data.path,
          method: 'GET'
        }
        processZillowData = ((res) ->
          zillowXML = ''
          # keep track of data received
          res.on 'data', ((zillowData) ->
            zillowXML += zillowData + "\n"
          )
          # on end send the data to the client
          res.on 'end', (->
            socket.emit 'receive', {'zillowData': zillowXML}
          )
          res.on 'error', ((err) ->
            console.log err
          )
        )
        do (http.request options, processZillowData).end
      )
    )

# export it
module.exports = SocketServer
