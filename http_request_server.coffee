###
@file http_request_server.coffee

@brief HTTP request server, spits back text/json. Used to query
       our db from the client.
@author Lucas Ray (ltray)
###

#################################################################
# requires
#################################################################
PassportLocalStrategy = require('passport-local').Strategy
FacebookStrategy      = require('passport-facebook').Strategy
passport              = require('passport')
express               = require('express')
flash                 = require("connect-flash")
q                     = require('q')

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
      @app.use(passport.initialize())
      @app.use(passport.session())
      @app.use(flash())
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
    getGreenscore: ((args, user, onSuccess, onFailure) ->
      # TODO: use naive bayes or something to estimate better
      # wrapper for our estimation state machine. Needed to resolve
      # synchrony errors
      estimate_wrapper = ((depth) ->
        deferred = do q.defer

        # to handle eventual success of promise
        whenSuccess = (data) ->
          [this_estimate, this_num] = data

          # if enough residences, succeed
          if this_estimate >= 50
            onSuccess this_num

          # if too many trials, fail
          else if depth > 20
            onFailure "No match"

          # otherwise try again
          else
            estimate_wrapper (depth + 1)

        # to handle eventual failure of promise
        whenFailure = (data) ->
          onFailure "mySQL error"

        (@estimate_score depth, args, deferred).then whenSuccess, whenFailure
        return deferred.promise
      ).bind(this)

      # keep loosening our query until we find closest 50+ houses
      return estimate_wrapper 0
    ).bind(self),
  })

  estimate_score: (depth, args, deferred) ->
    ###
    @brief Estimates the greenscore given depth and args. Depth determines how
           general of a search to make.

    @param depth The depth of this search (higher depth = more general)
    @param args Arguments we need to determine the greenscore.
    @param deferred The deferred object.
    ###
    num_beds       = args.num_beds  ? 1
    square_footage = args.sqft      ? 800
    num_baths      = args.num_baths ? 1
    solar          = args.solar     ? false

    # our query constraints
    bedroom_hi = num_beds + depth * .4
    bedroom_lo = Math.max(num_beds - depth * .4, 0)
    sqft_hi    = square_footage + depth * 50
    sqft_lo    = Math.max(square_footage - depth * 50, 0)
    bath_hi    = num_baths + depth * .4
    bath_lo    = Math.max(num_baths - depth * .4, 0)
    solar_hi   = solar_lo = if solar is false then 0 else 1

    query = "SELECT DOLLAREL, DOLLARNG, KWH FROM RECS05 WHERE " +
            "BEDROOMS <= #{bedroom_hi} AND BEDROOMS >= #{bedroom_lo} AND " +
            "TOTSQFT <= #{sqft_hi} AND TOTSQFT >= #{sqft_lo} AND " +
            "NCOMBATH <= #{bath_hi} AND NCOMBATH >= #{bath_lo} AND " +
            "USESOLAR <= #{solar_hi} AND USESOLAR >= #{solar_lo}"

    # on success, compute the greenscore
    onSuccess = (rows) ->
      totscore = 0
      for row in rows
        totscore += parseInt row['DOLLAREL']

      totscore /= rows.length
      deferred.resolve([totscore, rows.length])

    # on failure, just return 0, 0 (something went wrong, user is notified
    # by caller)
    onFailure = (err) ->
      console.log err
      deferred.reject([0, 0])

    # get result and return a promise
    @mysql_query query, onSuccess, onFailure
    return deferred.promise

  listen: ->
    ###
    @brief Listens on the specified port.
    ###
    console.log "Listening on port #{@port}"
    workingDir = __dirname + "/app"
    @app.use("/", express.static(workingDir))
    @app.get("/", ((request, response) ->
      response.sendfile(workingDir + "/index.html")))

    ###
    @brief passport stuff
    ###
    # facebook strategy
    passport.use(new FacebookStrategy({
        clientID: "121594388000133"
        clientSecret: "0d478582454ff9d8755f2ebb48dccf28"
        callbackURL: "http://localhost:8080"
      },
      (accessToken, refreshToken, profile, done) ->
        # handwaved away unused
        User.findOrCreate(unused..., (err, user) ->
          if (err)
            return done(err)
          done(null, user)
        )
    ))

    # define methods for facebook authentication
    @app.get('/auth/facebook', passport.authenticate('facebook'))
    @app.get('/auth/facebook/callback',
      passport.authenticate('facebook', { successRedirect: '/',\
                                      failureRedirect: '/login' }))

    # define methods for local authentication
    passport.use(new PassportLocalStrategy(
      (username,password,done) -> done(null, false, { message: 'unimp' })))

    @app.post('/login', passport.authenticate('local', {\
      successRedirect: '/',\
      failureRedirect: '/login' }))


    @app.listen @port
    process.on "uncaughtException", @onUncaughtException

    # connect to our db
    do @mysql_connect

  construct_greenscore_query: (args) ->
    ###
    @brief Constructs a greenscore SQL query given the input.

    @param args The arguments we're basing our query off of.
    ###
    num_beds = args.num_beds ? 1
    square_footage = args.sqft ? 1600
    num_baths = args.num_baths ? 1
    solar = args.solar ? false
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

  mysql_query: (query, onSuccess, onFailure) ->
    ###
    @brief Allows client to make arbitrary sql queries.

    FIXME: THIS IS SO BAD OMG
    ###
    if @conn is undefined
      onFailure "No mySQL connection established"
    else
      @conn.query query, ((err, rows) ->
        if err is not null
          onFailure err
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
