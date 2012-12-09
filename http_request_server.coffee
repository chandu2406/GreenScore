###
@file http_request_server.coffee

@brief HTTP request server, spits back text/json. Used to query
       our db from the client.
@author Lucas Ray (ltray)
@author Nick LaGrow (nlagrow)
###

#################################################################
# requires
#################################################################
PassportLocalStrategy = require('passport-local').Strategy
FacebookStrategy      = require('passport-facebook').Strategy
passport              = require('passport')
express               = require('express')
flash                 = require('connect-flash')
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
          if this_num >= 50
            onSuccess this_estimate

          # if too many trials, fail
          else if depth > 20
            onFailure "No match"

          # otherwise try again
          else
            estimate_wrapper (depth + 1)

        # to handle eventual failure of promise
        whenFailure = (data) ->
          onFailure "mySQL error"

        # when promise is resolved or rejected, act
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
    square_footage = args.sqft      ? 1200
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
            "TOTSQFT  <= #{sqft_hi}    AND TOTSQFT >=  #{sqft_lo}    AND " +
            "NCOMBATH <= #{bath_hi}    AND NCOMBATH >= #{bath_lo}    AND " +
            "USESOLAR <= #{solar_hi}   AND USESOLAR >= #{solar_lo}"

    # on success, compute the greenscore
    onSuccess = (rows) ->
      totscore = 0
      for row in rows
        # TODO: fix these heuristics
        # 1100 is average DOLLAREL, 8265 is max
#        totscore += 8265 / parseInt row['DOLLAREL']

        # 99999 is max DOLLARNG
#        totscore += 99999 / parseInt row['DOLLARNG']

        # 72175 is max KWH
        kwh = parseInt row['KWH']
        totscore += 72175 / (if kwh is 0 then 1 else kwh)

      totscore /= rows.length

      # no reason to multiply by 4, just lots of houses getting super low
      # scores. This logic is to be replaced anyway, as this is mainly
      # a proof of concept.
      totscore *= 4
      totscore = 100 if totscore > 100
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
        callbackURL: "http://localhost:" + process.env.PORT
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
      passport.authenticate('facebook', { successRedirect: '/SUCCEED',\
                                      failureRedirect: '/FAIL' }))

    @app.post('/login', ((req, res, next) ->
      console.log("received /login post")
      passport.authenticate('local', ((error, user, info) ->
        console.log('authentication callback')
        if (error)
          console.log("auth error")
          return next(error)

        if (!user)
          return res.send({success: 'false',\
                  user_id: undefined,\
                  message: 'login failed'})

        return res.send({success: 'true',\
                  user_id: user,\
                  message: 'login succeeded'})
      ))(req,res,next)
    ))

    # define methods for local authentication
    # TODO make this a real function
    passport.use(new PassportLocalStrategy(
      (username,password,done) ->
        console.log("authenticating with local strategy")
        user = username

        # verify valid username
        if (user != 'nick')
          console.log("bad username")
          return done(null, false, {message: 'Unknown user '+username})

        # verify valid password
        if (password != 'word')
          console.log("bad pw")
          return done(null, false, {message: 'invalid password'})

        # return success
        done(null, user)
    ))

    @app.listen @port
    process.on "uncaughtException", @onUncaughtException

    # connect to our db
    do @mysql_connect

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
        console.log "Could not connect to mySQL db: "
        console.log err
      else
        console.log "Connected to mySQL db")

  mysql_query: (query, onSuccess, onFailure) ->
    ###
    @brief Allows client to make arbitrary sql queries.

    WARNING: This function executes abitrary sql queries. DO NOT EXPOSE THIS
             FUNCTION TO THE USER. And be careful what you input (no "DROP
             TABLE RECS05;" please)
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
