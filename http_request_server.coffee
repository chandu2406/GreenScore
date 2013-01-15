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
KettleSQL             = require('./kettle_sql')
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
      if rows == undefined
        return deferred.reject([0, 0])

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
      totscore = parseInt totscore
      deferred.resolve([totscore, rows.length])

    # on failure, just return 0, 0 (something went wrong, user is notified
    # by caller)
    onFailure = (err) ->
      console.log err
      deferred.reject([0, 0])

    # get result and return a promise
    @mysql_query query, onSuccess, onFailure
    return deferred.promise

  register_user: (username, password, email, address, response) ->
    ###
    @brief register a user in the USERS database
    @param  username  new username
    @param  password  new password
    @param  address   address (as given by autocomplete)
    @param  response  place to send response
    ###
    query = "SELECT * FROM USERS WHERE USERNAME='#{username}'"
    onSuccess = ((rows) ->
      onRegistration = (rows) ->
        console.log("#{username} registered.")
        return response.send({success: 'true',\
                              user_id: username,\
                              message: 'Login succeeded'})

      if rows != undefined and rows.length > 0
        console.log(username + " already exists as a user.")
        return response.send({success: 'false',\
                              user_id: undefined,\
                              message: "Login failed: #{username} aready exists."})
      else
        console.log("#{username} is a new user.")
        to_insert = "INSERT INTO USERS (USERNAME,PASSWORD,EMAIL,ADDRESS) " +
          "VALUES ('#{username}','#{password}','#{email}','#{address}')"
        console.log to_insert
        @mysql_query to_insert, onRegistration, onFailure).bind(this)

    onFailure = (err) ->
      console.log err
    @mysql_query query, onSuccess, onFailure

  modify_user: (username, email, address, response) ->
    ###
    @brief register a user in the USERS database
    @param  username  new username
    @param  password  new password
    @param  address   address (as given by autocomplete)
    @param  response  place to send response
    ###
    query = "SELECT * FROM USERS WHERE USERNAME='#{username}'"
    to_mod = "UPDATE USERS SET "
    onSuccess = ((rows) ->
      onRegistration = (rows) ->
        console.log("#{username} registered.")
        return response.send({success: 'true',\
                              user_id: username,\
                              email: email,\
                              address: address,\
                              message: 'Update succeeded'})

      if rows != undefined and rows.length > 0
        console.log(username + " exists as a user.")

        # Make sure we're actually changing something
        if email == undefined && address == undefined
          return response.send({success: 'false',\
                                user_id: username,\
                                message: "Login failed: #{username}: no data changed"})

        # build the query
        change_email = if email == undefined then "" else "EMAIL='#{email}'"
        change_addr = if address == undefined then "" else "ADDRESS='#{address}'"
        if change_email != "" and change_addr != ""
          change_addr = ","+change_addr

        to_mod = to_mod + change_email + change_addr + " WHERE USERNAME='#{escape(username)}'"
        console.log to_mod

        @mysql_query to_mod, onRegistration, onFailure
      else
        console.log("#{username} is not a current user.")
        return response.send({success: 'false',\
                              user_id: username,\
                              message: "Login failed: #{username} doesn't exist."})
    ).bind(this)

    onFailure = (err) ->
      console.log err
    @mysql_query query, onSuccess, onFailure

  register_address: (args, response) ->
    ###
    @brief add an address to the address table
    @param  args    the fields to add to the table
    @param  respone where to send the results
    ###

    console.log args
    # first, check to see whether the call even makes sense
    if args == undefined or args["address"] == undefined
      return response.send({success: 'false',\
                            user_id: undefined,\
                            message: "Bad request - No address specified."})

    # determine whether address already exists in the table
    addr = args["address"]
    num_baths = args["num_baths"]
    num_beds = args["num_beds"]
    sqft = args["sqft"]
    solar = args["solar"]

    console.log args
    console.log num_baths
    console.log num_beds
    console.log sqft
    console.log solar

    query = "SELECT * FROM ADDRESSES WHERE ADDRESS='#{addr}'"

    onSuccess = ((rows) ->

      onRegistration = (rows) ->
        console.log("#{addr} updated.")
        return response.send({success: 'true',\
                              address: addr,\
                              num_baths: num_baths,\
                              num_beds: num_beds,\
                              sqft: sqft,\
                              solar: solar,\
                              message: "#{addr} updated"})

      # create a new row if need be
      if rows == undefined or rows.length == 0
        # in this case, we are inserting a new record into the table
        # build the insertion query
        to_insert = "INSERT INTO ADDRESSES "
        insert_names = "(ADDRESS"
        insert_value = "VALUES ('#{addr}'"

        if num_baths != undefined
          insert_names += ", NUM_BATHS"
          insert_value += ",'#{num_baths}'"

        if num_beds != undefined
          insert_names += ", NUM_BEDS"
          insert_value += ",'#{num_beds}'"

        if sqft != undefined
          insert_names += ", SQFT"
          insert_value += ",'#{sqft}'"

        if solar != undefined
          insert_names += ", SOLAR"
          insert_value += ",'#{solar}'"

        insert_names += ") "
        insert_value += ")"
        to_insert = to_insert + insert_names + insert_value
        console.log to_insert


        return @mysql_query to_insert, onRegistration, onFailure

      else if rows != undefined && rows.length == 1
        # in this case we are updating a currently existing record
        # build the update query
        to_mod = "UPDATE ADDRESSES SET ADDRESS='#{addr}'"
        mod_value = ""

        # check for valid replacements
        # TODO do this in a way that's easier to add new fields
        if num_baths != undefined
          mod_value += ",NUM_BATHS='#{num_baths}'"

        if num_beds != undefined
          mod_value += ",NUM_BEDS='#{num_beds}'"

        if sqft != undefined
          mod_value += ",SQFT='#{sqft}'"

        if solar != undefined
          mod_value += ",SOLAR='#{solar}'"

        to_mod += mod_value
        to_mod += " WHERE ADDRESS='#{addr}'"
        console.log to_mod
        return @mysql_query to_mod, onRegistration, onFailure
      else
        console.log("BAD?")
        console.log to_insert
        return @mysql_query to_insert, onRegistration, onFailure).bind(this)

    onFailure = (err) ->
      console.log err
    @mysql_query query, onSuccess, onFailure

  request_address_data: (address, response) ->
    ###
    @brief lookup a given addrss
    @param  response where to send the results
    ###

    console.log address

    # first, check to see whether the call even makes sense
    if address == undefined
      return response.send({success: 'false',\
                            user_id: undefined,\
                            message: "Bad request - No address specified."})

    query = "SELECT * FROM ADDRESSES WHERE ADDRESS='#{address}'"

    onSuccess = (rows) ->
      # create a new row if need be
      if rows == undefined or rows.length == 0
        # nothing found
        return response.send({success: 'false',\
                              message: "Bad request - No data found for that address."})

      else if rows != undefined && rows.length >= 1
        # we did find something
        return response.send({success: 'true',\
                              data: rows[0],\
                              message: "Data found."})
    onFailure = (err) ->
      console.log err
    @mysql_query query, onSuccess, onFailure

  request_user_data: (username, response) ->
    ###
    @brief request database information for a given user
    @param  username  the username to use as a key
    @param  response  where to send the response
    ###
    query = "SELECT * FROM USERS WHERE USERNAME='#{username}'"
    onSuccess = (rows) ->
      console.log("#{username} has data.")
      # if there are no records, return an error
      if rows == undefined or rows.length < 1
        return response.send({success: 'false',\
                              user_id: username,\
                              message: "Login failed - no entries for #{username}"})
      # if there are >= 1 records, return the first
      else
        return response.send({success: 'true',\
                              user_id: username,\
                              email:   rows[0].EMAIL,\
                              address: rows[0].ADDRESS,\
                              message: "Succesfully got data for #{username}"})
    onFailure = (err) ->
      return console.log err

    @mysql_query query, onSuccess, onFailure

  listen: ->
    ###
    @brief Listens on the specified port.
    ###
    console.log "Listening on port #{@port}"
    workingDir = __dirname + "/app"
    @app.use("/", express.static(workingDir))
    @app.get("/", ((request, response) ->
      response.sendfile(workingDir + "/index.html")))

    # facebook strategy
    port = process.env.PORT or 15237
    passport.use(new FacebookStrategy({
        clientID: "121594388000133"
        clientSecret: "0d478582454ff9d8755f2ebb48dccf28"
        callbackURL: "http://localhost:15237/auth/facebook/callback"
        passReqToCallback: true
      },
      (req, accessToken, refreshToken, profile, done) ->
        process.nextTick( ->
          return done(null, profile))
    ))

    passport.serializeUser((user, done) ->
      done(null, user))

    passport.deserializeUser((obj, done) ->
      done(null, obj))

    # define methods for facebook authentication
    @app.get('/auth/facebook', passport.authenticate('facebook'))
    @app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {failureRedirect: "/"}),
      ((req,res) ->
        #TODO these are temporary values
        uname = req['user']['username']
        console.log uname
        email = ''
        pw = ''
        address = ''

        # Build facebook profile
        @register_user uname, pw, email, address, res
        res.redirect("/")
      ).bind(this))

    # registration
    @app.post('/register', ((request, response) ->
      console.log "received /register post"
      args = request.query

      # validation needs to be done here
      uname = args['username']
      console.log uname
      pw = args['password']
      console.log pw
      email = args['email']
      console.log email
      address = args['address']
      console.log address
      @register_user uname, pw, email, address, response
    ).bind(this))

    # address addition
    @app.post('/modify_address', ((request, response) ->
      console.log "received /modify_address post"
      args = request.query
      console.log args
      @register_address args, response
    ).bind(this))

    # user modification
    @app.post('/modify_user', ((request, response) ->
      console.log "received /modify_user post"
      args = request.query
      console.log args
      username = args['username']
      email = args['email']
      address = args['address']
      @modify_user username, email, address, response
    ).bind(this))

    # address request
    @app.get('/get_address_data', ((request, response) ->
      console.log "received get_address_data"
      args = request.query
      addr = args['address']
      console.log addr
      @request_address_data addr, response
    ).bind(this))

    # get user data
    @app.get('/get_user_data', ((request, response) ->
      console.log "received get_user_data"
      args = request.query

      # validation
      uname = args['username']
      console.log uname
      @request_user_data uname, response
    ).bind(this))

    # local login
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
                           message: 'Login failed: ' + info})
        else
          return res.send({success: 'true',\
                           user_id: user,\
                           message: 'Login succeeded'})
      ))(req,res,next)
    ))

    # local strategy
    passport.use(new PassportLocalStrategy(
      ((username,password,done) ->
        onSuccess = ((rows) ->
          if rows is undefined or rows.length != 1
            console.log 'fail - no user'
            return done(null, false, 'No account found or conflicting accounts.')
          else if rows[0].PASSWORD != password
            console.log 'fail - incorrect password'
            console.log rows
            console.log password
            return done(null, false, 'Incorrect password.')
          else
            console.log 'success'
            return done(null,username))
        onFailure = ((rows) ->
          console.log 'fail'
          return done(null,false, 'Bad user or password'))

        query = "SELECT PASSWORD FROM USERS WHERE USERNAME='#{username}'"
        @mysql_query query, onSuccess, onFailure
      ).bind(this))
    )

    @app.listen @port
    process.on "uncaughtException", @onUncaughtException

    # connect to our db
    do @mysql_connect

  mysql_connect: ->
    ###
    @brief Establishes a connection with our sql database.
    ###
    conn_factory = new KettleSQL
    @conn = conn_factory.connect()
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
