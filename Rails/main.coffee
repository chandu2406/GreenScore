###
@file main.coffee

@brief Main file for our server(s)
@author Lucas Ray (ltray)
###

HTTPRequestServer = require('./http_request_server')
SocketServer = require('./socket_server')

main = () ->
  ###
  @brief Main function.
  ###
  http_server = new HTTPRequestServer process.env.PORT or 15237
  socket_server = new SocketServer 3000

  do http_server.listen
  do socket_server.listen

do main
