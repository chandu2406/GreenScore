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
      socket.on 'compSearch', ((data) ->
        console.log "beginning comp search"

        options = {host: 'www.zillow.com', path: data.path, method: 'GET'}

        processZillowData = ((res) ->
          zillowXML = ''
          # keep track of data received
          res.on 'data', ((zillowData) ->
            zillowXML += zillowData
          )
          # on end send the data to the client
          res.on 'end', (->
            socket.emit 'compResults', {'zillowData': zillowXML}
          )
          res.on 'error', ((err) ->
            console.log err
          )
        )
        do (http.request options, processZillowData).end
      )

      socket.on 'scoreRequest', ((data) ->
        ###
        @brief handles a request for a greenscore
        @param data packet sent to the server
        Expects sqft, num_beds, num_baths, solar
        ###
        console.log "got a greenscore request"
        console.log data.num_beds
        console.log data.num_baths
        console.log data.sqft

        if (data.num_beds == undefined)
          data.num_beds = 0
        if (data.num_baths == undefined)
          data.num_baths = 0
        if (data.sqft == undefined)
          data.sqft = 0

        args = "?sqft="+Math.floor(data.sqft)+"&num_beds="+Math.floor(data.num_beds)+"&num_baths="+Math.floor(data.num_baths)
        options = {host: 'localhost', path: '/json/getGreenscore'+args, port:8080, method: 'GET'}
        console.log options.path
        processScoreRequest = ((res) ->
          console.log('processing score request!')
          totalData = ''
          # keep track of data received
          res.on 'data', ((newData) ->
            totalData += newData
          )
          # on end send the data to the client
          res.on 'end', (->
            socket.emit 'scoreResults', {'greenscore': totalData}
          )
          res.on 'error', ((err) ->
            console.log err
          )
        )
        do (http.request options, processScoreRequest).end
      )
    )


# export it
module.exports = SocketServer
