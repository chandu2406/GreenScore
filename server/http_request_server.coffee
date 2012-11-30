###
@file http_request_server.coffee

@brief HTTP request server, spits back text/json. Used to query
       our db from the client.
@author Lucas Ray (ltray)
###

#################################################################
# requires
#################################################################
express = require('express')

#################################################################
# http request server class
#################################################################
class HTTPRequestServer
  constructor: (@port) ->
    ###
    @brief Constructor for an HTTPRequestServer

    @param port The port we're listening on
    ###
    do @init

  init: ->
    ###
    @brief Initializes this server.
    ###
    @app = express()
    @app.configure((->
      @app.use(express.cookieParser())
      @app.use(express.bodyParser())
      @app.use(express.methodOverride())
      @app.use(express.session {secret: 'whatisthis'})
      @app.use(@app.router)
    ).bind(this))
    @app.all '/json/:cmd', (@processJSONCmd).bind(this)

  processJSONCmd: (request, response) ->
    ###
    @brief Processes a JSON command

    @param request The input request.
    @param response The output response.
    ###
    cmd = request.params.cmd
    args = request.query
    # iOS caches POSTs?
    response.header "Cache-control", "no-cache"
    @cmdHandler cmd, request.user, args, response

  cmdHandler: (cmd, user, args, response) ->
    ###
    @brief Generalized command handler.

    @param cmd Command we are handling.
    @param user User executing this command.
    @param args Arguments for this command.
    @param response Response we're writing to
    ###

    # Function to handle successful requests
    onSuccess = ((result) ->
      @sendObjectAsJSON response, {'result': result}).bind(this)

    # Function to handle errors
    onFailure = ((error) ->
      @sendObjectAsJSON response, {'err': error}).bind(this)

    @cmdHandlers(this)[cmd](args, user, onSuccess, onFailure)

  sendObjectAsJSON: (response, object) ->
    ###
    @brief Sends the input JSON object to user as text/json

    @param response The response we're writing to.
    @param object The object we're sending
    ###
    response.write (JSON.stringify object)
    do response.end

  # Command handlers
  cmdHandlers: ((self) -> {
    getGreenscore: ((args, user, onSuccess, onError) ->
      @mysql_query (@construct_greenscore_query args), onSuccess, onError
    ).bind(self),

    # TEMP: echo
    echo: ((args, user, onSuccess, onError) ->
      ret = "Echo: #{args.msg}"
      onSuccess ret),

    # TEMP: sum
    sum: ((args, user, onSuccess, onError) ->
      ret = parseInt(args.x, 10) + parseInt(args.y, 10)
      onSuccess ret)
  })

  listen: ->
    ###
    @brief Listens on the specified port.
    ###
    console.log "Listening on port #{@port}"
    workingDir = __dirname + "/../app"
    @app.use("/", express.static(workingDir))
    @app.get("/", ((request, response) ->
      response.render(workingDir + "/index.html")))
    @app.listen @port
    process.on "uncaughtException", @onUncaughtException

    # connect to our db
    do @mysql_connect

  construct_greenscore_query: (args) ->
    ###
    @brief Constructs a greenscore SQL query given the input.

    @param args The arguments we're basing our query off of.
    ###
    return "SELECT COFFEE FROM RECS05 LIMIT 0, 50"

  mysql_connect: ->
    ###
    @brief Establishes a connection with our sql database.
    ###
    mysql = require('mysql')
    @conn = mysql.createConnection({
#      socketPath: '/var/tmp/mysql.sock' # TODO: once local, use this instead of host/port
      host: 'kettle.ubiq.cs.cmu.edu'
      port: 3306
      user: 'greenscore'
      password: 'hf&kdsp1'
      database: 'greenscore'
      insecureAuth: true          # FIXME: this isn't good :(
    })
    @conn.connect((err) ->
      if err
        console.log err
      else
        console.log "Connected to mySQL db")

  mysql_query: (query, onSuccess, onError) ->
    ###
    @brief Allows client to make arbitrary sql queries.

    FIXME: THIS IS SO BAD OMG
    ###
    if @conn is undefined
      onError "No mySQL connection established"
    else
      @conn.query query, ((err, rows) ->
        if err is not null
          onError err
        else
          onSuccess rows
      )

  onUncaughtException: (error) ->
    ###
    @brief To handle uncaught exceptions (calling cmdHandler which doesn't
           exist)

    @param error The error we're catching.
    ###
    console.log "uncaught exception: " + error

# export it
module.exports = HTTPRequestServer
