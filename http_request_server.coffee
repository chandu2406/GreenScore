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


###
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
###
CryptoJS=`CryptoJS||function(i,p){var f={},q=f.lib={},j=q.Base=function(){function a(){}return{extend:function(h){a.prototype=this;var d=new a;h&&d.mixIn(h);d.$super=this;return d},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var d in a)a.hasOwnProperty(d)&&(this[d]=a[d]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),k=q.WordArray=j.extend({init:function(a,h){a=
this.words=a||[];this.sigBytes=h!=p?h:4*a.length},toString:function(a){return(a||m).stringify(this)},concat:function(a){var h=this.words,d=a.words,c=this.sigBytes,a=a.sigBytes;this.clamp();if(c%4)for(var b=0;b<a;b++)h[c+b>>>2]|=(d[b>>>2]>>>24-8*(b%4)&255)<<24-8*((c+b)%4);else if(65535<d.length)for(b=0;b<a;b+=4)h[c+b>>>2]=d[b>>>2];else h.push.apply(h,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<32-8*(b%4);a.length=i.ceil(b/4)},clone:function(){var a=
j.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],d=0;d<a;d+=4)b.push(4294967296*i.random()|0);return k.create(b,a)}}),r=f.enc={},m=r.Hex={stringify:function(a){for(var b=a.words,a=a.sigBytes,d=[],c=0;c<a;c++){var e=b[c>>>2]>>>24-8*(c%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var b=a.length,d=[],c=0;c<b;c+=2)d[c>>>3]|=parseInt(a.substr(c,2),16)<<24-4*(c%8);return k.create(d,b/2)}},s=r.Latin1={stringify:function(a){for(var b=
a.words,a=a.sigBytes,d=[],c=0;c<a;c++)d.push(String.fromCharCode(b[c>>>2]>>>24-8*(c%4)&255));return d.join("")},parse:function(a){for(var b=a.length,d=[],c=0;c<b;c++)d[c>>>2]|=(a.charCodeAt(c)&255)<<24-8*(c%4);return k.create(d,b)}},g=r.Utf8={stringify:function(a){try{return decodeURIComponent(escape(s.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return s.parse(unescape(encodeURIComponent(a)))}},b=q.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=k.create();
this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=g.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,d=b.words,c=b.sigBytes,e=this.blockSize,f=c/(4*e),f=a?i.ceil(f):i.max((f|0)-this._minBufferSize,0),a=f*e,c=i.min(4*a,c);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);b.sigBytes-=c}return k.create(g,c)},clone:function(){var a=j.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});q.Hasher=b.extend({init:function(){this.reset()},
reset:function(){b.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=b.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(b,d){return a.create(d).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return e.HMAC.create(a,d).finalize(b)}}});var e=f.algo={};return f}(Math);
(function(i){var p=CryptoJS,f=p.lib,q=f.WordArray,f=f.Hasher,j=p.algo,k=[],r=[];(function(){function f(a){for(var b=i.sqrt(a),d=2;d<=b;d++)if(!(a%d))return!1;return!0}function g(a){return 4294967296*(a-(a|0))|0}for(var b=2,e=0;64>e;)f(b)&&(8>e&&(k[e]=g(i.pow(b,0.5))),r[e]=g(i.pow(b,1/3)),e++),b++})();var m=[],j=j.SHA256=f.extend({_doReset:function(){this._hash=q.create(k.slice(0))},_doProcessBlock:function(f,g){for(var b=this._hash.words,e=b[0],a=b[1],h=b[2],d=b[3],c=b[4],i=b[5],j=b[6],k=b[7],l=0;64>
l;l++){if(16>l)m[l]=f[g+l]|0;else{var n=m[l-15],o=m[l-2];m[l]=((n<<25|n>>>7)^(n<<14|n>>>18)^n>>>3)+m[l-7]+((o<<15|o>>>17)^(o<<13|o>>>19)^o>>>10)+m[l-16]}n=k+((c<<26|c>>>6)^(c<<21|c>>>11)^(c<<7|c>>>25))+(c&i^~c&j)+r[l]+m[l];o=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&a^e&h^a&h);k=j;j=i;i=c;c=d+n|0;d=h;h=a;a=e;e=n+o|0}b[0]=b[0]+e|0;b[1]=b[1]+a|0;b[2]=b[2]+h|0;b[3]=b[3]+d|0;b[4]=b[4]+c|0;b[5]=b[5]+i|0;b[6]=b[6]+j|0;b[7]=b[7]+k|0},_doFinalize:function(){var f=this._data,g=f.words,b=8*this._nDataBytes,
e=8*f.sigBytes;g[e>>>5]|=128<<24-e%32;g[(e+64>>>9<<4)+15]=b;f.sigBytes=4*g.length;this._process()}});p.SHA256=f._createHelper(j);p.HmacSHA256=f._createHmacHelper(j)})(Math);
`

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

  register_user: (username, password, email, address, response) ->
    query = "SELECT * FROM USERS WHERE USERNAME='"+username+"'"
    onSuccess = ((rows) ->
      onRegistration = (rows) ->
        console.log(username + " registered.")
        return response.send({success: 'true',\
                         user_id: username,\
                         message: 'Login succeeded'})

      if rows != undefined and rows.length > 0
        console.log(username + " already exists as a user.")
        return response.send({success: 'false',\
                         user_id: undefined,\
                         message: 'Login failed: '+username+' aready exists.'})
      else
        console.log(username + " is a new user.")
        to_insert = "INSERT INTO USERS (USERNAME,PASSWORD,EMAIL,ADDRESS) " +
          "VALUES (\""+username+"\",\""+CryptoJS.SHA256(password)+"\",\""+email+"\",\""+address+"\")"
        console.log to_insert
        @mysql_query to_insert, onRegistration, onFailure).bind(this)

    onFailure = (err) ->
      console.log err
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
          if rows.length != 1
            console.log 'fail'
            return done(null, false, 'No account found or conflicting accounts.')
          else if rows[0].PASSWORD != CryptoJS.SHA256(password)+""
            console.log 'fail'
            console.log rows
            console.log CryptoJS.SHA256(password) + ""
            return done(null, false, 'Incorrect password.')
          else
            console.log 'success'
            return done(null,username))
        onFailure = ((rows) ->
          console.log 'fail'
          return done(null,false, 'Bad user or password'))

        query = "SELECT PASSWORD FROM USERS WHERE USERNAME='"+username+"'"
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
