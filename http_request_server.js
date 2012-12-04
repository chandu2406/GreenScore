// Generated by CoffeeScript 1.4.0

/*
@file http_request_server.coffee

@brief HTTP request server, spits back text/json. Used to query
       our db from the client.
@author Lucas Ray (ltray)
@author Nick LaGrow (nlagrow)
*/


(function() {
  var FacebookStrategy, HTTPRequestServer, PassportLocalStrategy, express, flash, passport, q,
    __slice = [].slice;

  PassportLocalStrategy = require('passport-local').Strategy;

  FacebookStrategy = require('passport-facebook').Strategy;

  passport = require('passport');

  express = require('express');

  flash = require('connect-flash');

  q = require('q');

  HTTPRequestServer = (function() {

    function HTTPRequestServer(port) {
      this.port = port;
      /*
          @brief Constructor for an HTTPRequestServer
      
          @param port The port we're listening on
      */

      this.init();
    }

    HTTPRequestServer.prototype.init = function() {
      /*
          @brief Initializes this server.
      */
      this.app = express();
      this.app.configure((function() {
        this.app.use(express.cookieParser());
        this.app.use(express.bodyParser());
        this.app.use(express.methodOverride());
        this.app.use(express.session({
          secret: 'whatisthis'
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use(flash());
        return this.app.use(this.app.router);
      }).bind(this));
      return this.app.all('/json/:cmd', this.processJSONCmd.bind(this));
    };

    HTTPRequestServer.prototype.processJSONCmd = function(request, response) {
      /*
          @brief Processes a JSON command
      
          @param request The input request.
          @param response The output response.
      */

      var args, cmd;
      cmd = request.params.cmd;
      args = request.query;
      response.header("Cache-control", "no-cache");
      return this.cmdHandler(cmd, request.user, args, response);
    };

    HTTPRequestServer.prototype.cmdHandler = function(cmd, user, args, response) {
      /*
          @brief Generalized command handler.
      
          @param cmd Command we are handling.
          @param user User executing this command.
          @param args Arguments for this command.
          @param response Response we're writing to
      */

      var onFailure, onSuccess;
      onSuccess = (function(result) {
        return this.sendObjectAsJSON(response, {
          'result': result
        });
      }).bind(this);
      onFailure = (function(error) {
        return this.sendObjectAsJSON(response, {
          'err': error
        });
      }).bind(this);
      return this.cmdHandlers(this)[cmd](args, user, onSuccess, onFailure);
    };

    HTTPRequestServer.prototype.sendObjectAsJSON = function(response, object) {
      /*
          @brief Sends the input JSON object to user as text/json
      
          @param response The response we're writing to.
          @param object The object we're sending
      */
      response.write(JSON.stringify(object));
      return response.end();
    };

    HTTPRequestServer.prototype.cmdHandlers = (function(self) {
      return {
        getGreenscore: (function(args, user, onSuccess, onFailure) {
          var estimate_wrapper;
          estimate_wrapper = (function(depth) {
            var deferred, whenFailure, whenSuccess;
            deferred = q.defer();
            whenSuccess = function(data) {
              var this_estimate, this_num;
              this_estimate = data[0], this_num = data[1];
              if (this_num >= 50) {
                return onSuccess(this_estimate);
              } else if (depth > 20) {
                return onFailure("No match");
              } else {
                return estimate_wrapper(depth + 1);
              }
            };
            whenFailure = function(data) {
              return onFailure("mySQL error");
            };
            (this.estimate_score(depth, args, deferred)).then(whenSuccess, whenFailure);
            return deferred.promise;
          }).bind(this);
          return estimate_wrapper(0);
        }).bind(self)
      };
    });

    HTTPRequestServer.prototype.estimate_score = function(depth, args, deferred) {
      /*
          @brief Estimates the greenscore given depth and args. Depth determines how
                 general of a search to make.
      
          @param depth The depth of this search (higher depth = more general)
          @param args Arguments we need to determine the greenscore.
          @param deferred The deferred object.
      */

      var bath_hi, bath_lo, bedroom_hi, bedroom_lo, num_baths, num_beds, onFailure, onSuccess, query, solar, solar_hi, solar_lo, sqft_hi, sqft_lo, square_footage, _ref, _ref1, _ref2, _ref3;
      num_beds = (_ref = args.num_beds) != null ? _ref : 1;
      square_footage = (_ref1 = args.sqft) != null ? _ref1 : 1200;
      num_baths = (_ref2 = args.num_baths) != null ? _ref2 : 1;
      solar = (_ref3 = args.solar) != null ? _ref3 : false;
      bedroom_hi = num_beds + depth * .4;
      bedroom_lo = Math.max(num_beds - depth * .4, 0);
      sqft_hi = square_footage + depth * 50;
      sqft_lo = Math.max(square_footage - depth * 50, 0);
      bath_hi = num_baths + depth * .4;
      bath_lo = Math.max(num_baths - depth * .4, 0);
      solar_hi = solar_lo = solar === false ? 0 : 1;
      query = "SELECT DOLLAREL, DOLLARNG, KWH FROM RECS05 WHERE " + ("BEDROOMS <= " + bedroom_hi + " AND BEDROOMS >= " + bedroom_lo + " AND ") + ("TOTSQFT  <= " + sqft_hi + "    AND TOTSQFT >=  " + sqft_lo + "    AND ") + ("NCOMBATH <= " + bath_hi + "    AND NCOMBATH >= " + bath_lo + "    AND ") + ("USESOLAR <= " + solar_hi + "   AND USESOLAR >= " + solar_lo);
      onSuccess = function(rows) {
        var kwh, row, totscore, _i, _len;
        totscore = 0;
        for (_i = 0, _len = rows.length; _i < _len; _i++) {
          row = rows[_i];
          kwh = parseInt(row['KWH']);
          totscore += 72175 / (kwh === 0 ? 1 : kwh);
        }
        totscore /= rows.length;
        totscore *= 4;
        if (totscore > 100) {
          totscore = 100;
        }
        return deferred.resolve([totscore, rows.length]);
      };
      onFailure = function(err) {
        console.log(err);
        return deferred.reject([0, 0]);
      };
      this.mysql_query(query, onSuccess, onFailure);
      return deferred.promise;
    };

    HTTPRequestServer.prototype.listen = function() {
      /*
          @brief Listens on the specified port.
      */

      var workingDir;
      console.log("Listening on port " + this.port);
      workingDir = __dirname + "/app";
      this.app.use("/", express["static"](workingDir));
      this.app.get("/", (function(request, response) {
        return response.sendfile(workingDir + "/index.html");
      }));
      /*
          @brief passport stuff
      */

      passport.use(new FacebookStrategy({
        clientID: "121594388000133",
        clientSecret: "0d478582454ff9d8755f2ebb48dccf28",
        callbackURL: "http://localhost:8080"
      }, function(accessToken, refreshToken, profile, done) {
        return User.findOrCreate.apply(User, __slice.call(unused).concat([function(err, user) {
          if (err) {
            return done(err);
          }
          return done(null, user);
        }]));
      }));
      this.app.get('/auth/facebook', passport.authenticate('facebook'));
      this.app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/failuretemp'
      }));
      this.app.post('/login', (function(req, res, next) {
        console.log("received /login post");
        return passport.authenticate('local', (function(error, user, info) {
          console.log('authentication callback');
          if (error) {
            console.log("auth error");
            return next(error);
          }
          if (!user) {
            console.log("no user");
            return res.redirect('/failure');
          }
          console.log("success");
          return res.redirect('/');
        }))(req, res, next);
      }));
      passport.use(new PassportLocalStrategy(function(username, password, done) {
        var user;
        console.log("authenticating with local strategy");
        user = username;
        if (user !== 'nick') {
          console.log("bad username");
          return done(null, false, {
            message: 'Unknown user ' + username
          });
        }
        if (password !== 'word') {
          console.log("bad pw");
          return done(null, false, {
            message: 'invalid password'
          });
        }
        return done(null, user);
      }));
      this.app.listen(this.port);
      process.on("uncaughtException", this.onUncaughtException);
      return this.mysql_connect();
    };

    HTTPRequestServer.prototype.mysql_connect = function() {
      /*
          @brief Establishes a connection with our sql database.
      */

      var mysql;
      mysql = require('mysql');
      this.conn = mysql.createConnection({
        host: 'kettle.ubiq.cs.cmu.edu',
        port: 3306,
        user: 'greenscore',
        password: 'hf&kdsp1',
        database: 'greenscore',
        insecureAuth: true
      });
      return this.conn.connect(function(err) {
        if (err) {
          console.log("Could not connect to mySQL db: ");
          return console.log(err);
        } else {
          return console.log("Connected to mySQL db");
        }
      });
    };

    HTTPRequestServer.prototype.mysql_query = function(query, onSuccess, onFailure) {
      /*
          @brief Allows client to make arbitrary sql queries.
      
          WARNING: This function executes abitrary sql queries. DO NOT EXPOSE THIS
                   FUNCTION TO THE USER. And be careful what you input (no "DROP
                   TABLE RECS05;" please)
      */
      if (this.conn === void 0) {
        return onFailure("No mySQL connection established");
      } else {
        return this.conn.query(query, (function(err, rows) {
          if (err === !null) {
            return onFailure(err);
          } else {
            return onSuccess(rows);
          }
        }));
      }
    };

    HTTPRequestServer.prototype.onUncaughtException = function(error) {
      /*
          @brief To handle uncaught exceptions (calling cmdHandler which doesn't
                 exist)
      
          @param error The error we're catching.
      */
      return console.log("uncaught exception: " + error);
    };

    return HTTPRequestServer;

  })();

  module.exports = HTTPRequestServer;

}).call(this);
