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
    return

  listen: () ->
    ###
    @brief Starts this server listening.
    ###
    io = require('socket.io').listen(@port)
    http = require('http')

    # Listen for client connection event
    io.sockets.on 'connection', ((socket) ->
      # make an HTTP request to a URL sent by the client and send back the xml
      # response
      socket.on 'simpleSearch', ((data) ->
        console.log "beginning simple search"

        options = {host: 'www.zillow.com', path: data.path, method: 'GET'}

        processZillowData = ((res) ->
          zillowXML = ''
          # keep track of data received
          res.on 'data', ((zillowData) ->
            zillowXML += zillowData
          )
          # on end send the data to the client
          res.on 'end', (->
            socket.emit 'searchResults', {'zillowData': zillowXML}
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
