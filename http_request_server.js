// Generated by CoffeeScript 1.3.3

/*
@file http_request_server.coffee

@brief HTTP request server, spits back text/json. Used to query
       our db from the client.
@author Lucas Ray (ltray)
@author Nick LaGrow (nlagrow)
*/


(function() {
  var FacebookStrategy, HTTPRequestServer, KettleSQL, PassportLocalStrategy, express, flash, passport, q;

  PassportLocalStrategy = require('passport-local').Strategy;

  FacebookStrategy = require('passport-facebook').Strategy;

  KettleSQL = require('./kettle_sql');

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
        if (rows === void 0) {
          return deferred.reject([0, 0]);
        }
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
        totscore = parseInt(totscore);
        return deferred.resolve([totscore, rows.length]);
      };
      onFailure = function(err) {
        console.log(err);
        return deferred.reject([0, 0]);
      };
      this.mysql_query(query, onSuccess, onFailure);
      return deferred.promise;
    };

    HTTPRequestServer.prototype.register_user = function(username, password, email, address, response) {
      /*
          @brief register a user in the USERS database
          @param  username  new username
          @param  password  new password
          @param  address   address (as given by autocomplete)
          @param  response  place to send response
      */

      var onFailure, onSuccess, query;
      query = "SELECT * FROM USERS WHERE USERNAME='" + username + "'";
      onSuccess = (function(rows) {
        var onRegistration, to_insert;
        onRegistration = function(rows) {
          console.log("" + username + " registered.");
          return response.send({
            success: 'true',
            user_id: username,
            message: 'Login succeeded'
          });
        };
        if (rows !== void 0 && rows.length > 0) {
          console.log(username + " already exists as a user.");
          return response.send({
            success: 'false',
            user_id: void 0,
            message: "Login failed: " + username + " aready exists."
          });
        } else {
          console.log("" + username + " is a new user.");
          to_insert = "INSERT INTO USERS (USERNAME,PASSWORD,EMAIL,ADDRESS) " + ("VALUES ('" + username + "','" + password + "','" + email + "','" + address + "')");
          console.log(to_insert);
          return this.mysql_query(to_insert, onRegistration, onFailure);
        }
      }).bind(this);
      onFailure = function(err) {
        return console.log(err);
      };
      return this.mysql_query(query, onSuccess, onFailure);
    };

    HTTPRequestServer.prototype.modify_user = function(username, email, address, response) {
      /*
          @brief register a user in the USERS database
          @param  username  new username
          @param  password  new password
          @param  address   address (as given by autocomplete)
          @param  response  place to send response
      */

      var onFailure, onSuccess, query, to_mod;
      query = "SELECT * FROM USERS WHERE USERNAME='" + username + "'";
      to_mod = "UPDATE USERS SET ";
      onSuccess = (function(rows) {
        var change_addr, change_email, onRegistration;
        onRegistration = function(rows) {
          console.log("" + username + " registered.");
          return response.send({
            success: 'true',
            user_id: username,
            email: email,
            address: address,
            message: 'Update succeeded'
          });
        };
        if (rows !== void 0 && rows.length > 0) {
          console.log(username + " exists as a user.");
          if (email === void 0 && address === void 0) {
            return response.send({
              success: 'false',
              user_id: username,
              message: "Login failed: " + username + ": no data changed"
            });
          }
          change_email = email === void 0 ? "" : "EMAIL='" + email + "'";
          change_addr = address === void 0 ? "" : "ADDRESS='" + address + "'";
          if (change_email !== "" && change_addr !== "") {
            change_addr = "," + change_addr;
          }
          to_mod = to_mod + change_email + change_addr + (" WHERE USERNAME='" + (escape(username)) + "'");
          console.log(to_mod);
          return this.mysql_query(to_mod, onRegistration, onFailure);
        } else {
          console.log("" + username + " is not a current user.");
          return response.send({
            success: 'false',
            user_id: username,
            message: "Login failed: " + username + " doesn't exist."
          });
        }
      }).bind(this);
      onFailure = function(err) {
        return console.log(err);
      };
      return this.mysql_query(query, onSuccess, onFailure);
    };

    HTTPRequestServer.prototype.register_address = function(args, response) {
      /*
          @brief add an address to the address table
          @param  args    the fields to add to the table
          @param  respone where to send the results
      */

      var addr, num_baths, num_beds, onFailure, onSuccess, query, solar, sqft;
      console.log(args);
      if (args === void 0 || args["address"] === void 0) {
        return response.send({
          success: 'false',
          user_id: void 0,
          message: "Bad request - No address specified."
        });
      }
      addr = args["address"];
      num_baths = args["num_baths"];
      num_beds = args["num_beds"];
      sqft = args["sqft"];
      solar = args["solar"];
      console.log(args);
      console.log(num_baths);
      console.log(num_beds);
      console.log(sqft);
      console.log(solar);
      query = "SELECT * FROM ADDRESSES WHERE ADDRESS='" + addr + "'";
      onSuccess = (function(rows) {
        var insert_names, insert_value, mod_value, onRegistration, to_insert, to_mod;
        onRegistration = function(rows) {
          console.log("" + addr + " updated.");
          return response.send({
            success: 'true',
            address: addr,
            num_baths: num_baths,
            num_beds: num_beds,
            sqft: sqft,
            solar: solar,
            message: "" + addr + " updated"
          });
        };
        if (rows === void 0 || rows.length === 0) {
          to_insert = "INSERT INTO ADDRESSES ";
          insert_names = "(ADDRESS";
          insert_value = "VALUES ('" + addr + "'";
          if (num_baths !== void 0) {
            insert_names += ", NUM_BATHS";
            insert_value += ",'" + num_baths + "'";
          }
          if (num_beds !== void 0) {
            insert_names += ", NUM_BEDS";
            insert_value += ",'" + num_beds + "'";
          }
          if (sqft !== void 0) {
            insert_names += ", SQFT";
            insert_value += ",'" + sqft + "'";
          }
          if (solar !== void 0) {
            insert_names += ", SOLAR";
            insert_value += ",'" + solar + "'";
          }
          insert_names += ") ";
          insert_value += ")";
          to_insert = to_insert + insert_names + insert_value;
          console.log(to_insert);
          return this.mysql_query(to_insert, onRegistration, onFailure);
        } else if (rows !== void 0 && rows.length === 1) {
          to_mod = "UPDATE ADDRESSES SET ADDRESS='" + addr + "'";
          mod_value = "";
          if (num_baths !== void 0) {
            mod_value += ",NUM_BATHS='" + num_baths + "'";
          }
          if (num_beds !== void 0) {
            mod_value += ",NUM_BEDS='" + num_beds + "'";
          }
          if (sqft !== void 0) {
            mod_value += ",SQFT='" + sqft + "'";
          }
          if (solar !== void 0) {
            mod_value += ",SOLAR='" + solar + "'";
          }
          to_mod += mod_value;
          to_mod += " WHERE ADDRESS='" + addr + "'";
          console.log(to_mod);
          return this.mysql_query(to_mod, onRegistration, onFailure);
        } else {
          console.log("BAD?");
          console.log(to_insert);
          return this.mysql_query(to_insert, onRegistration, onFailure);
        }
      }).bind(this);
      onFailure = function(err) {
        return console.log(err);
      };
      return this.mysql_query(query, onSuccess, onFailure);
    };

    HTTPRequestServer.prototype.request_address_data = function(address, response) {
      /*
          @brief lookup a given addrss
          @param  response where to send the results
      */

      var onFailure, onSuccess, query;
      console.log(address);
      if (address === void 0) {
        return response.send({
          success: 'false',
          user_id: void 0,
          message: "Bad request - No address specified."
        });
      }
      query = "SELECT * FROM ADDRESSES WHERE ADDRESS='" + address + "'";
      onSuccess = function(rows) {
        if (rows === void 0 || rows.length === 0) {
          return response.send({
            success: 'false',
            message: "Bad request - No data found for that address."
          });
        } else if (rows !== void 0 && rows.length >= 1) {
          return response.send({
            success: 'true',
            data: rows[0],
            message: "Data found."
          });
        }
      };
      onFailure = function(err) {
        return console.log(err);
      };
      return this.mysql_query(query, onSuccess, onFailure);
    };

    HTTPRequestServer.prototype.request_user_data = function(username, response) {
      /*
          @brief request database information for a given user
          @param  username  the username to use as a key
          @param  response  where to send the response
      */

      var onFailure, onSuccess, query;
      query = "SELECT * FROM USERS WHERE USERNAME='" + username + "'";
      onSuccess = function(rows) {
        console.log("" + username + " has data.");
        if (rows === void 0 || rows.length < 1) {
          return response.send({
            success: 'false',
            user_id: username,
            message: "Login failed - no entries for " + username
          });
        } else {
          return response.send({
            success: 'true',
            user_id: username,
            email: rows[0].EMAIL,
            address: rows[0].ADDRESS,
            message: "Succesfully got data for " + username
          });
        }
      };
      onFailure = function(err) {
        return console.log(err);
      };
      return this.mysql_query(query, onSuccess, onFailure);
    };

    HTTPRequestServer.prototype.listen = function() {
      /*
          @brief Listens on the specified port.
      */

      var port, workingDir;
      console.log("Listening on port " + this.port);
      workingDir = __dirname + "/app";
      this.app.use("/", express["static"](workingDir));
      this.app.get("/", (function(request, response) {
        return response.sendfile(workingDir + "/index.html");
      }));
      port = process.env.PORT || 15237;
      passport.use(new FacebookStrategy({
        clientID: "121594388000133",
        clientSecret: "0d478582454ff9d8755f2ebb48dccf28",
        callbackURL: "http://localhost:15237/auth/facebook/callback",
        passReqToCallback: true
      }, function(req, accessToken, refreshToken, profile, done) {
        return process.nextTick(function() {
          return done(null, profile);
        });
      }));
      passport.serializeUser(function(user, done) {
        return done(null, user);
      });
      passport.deserializeUser(function(obj, done) {
        return done(null, obj);
      });
      this.app.get('/auth/facebook', passport.authenticate('facebook'));
      this.app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: "/"
      }), (function(req, res) {
        var address, email, pw, uname;
        uname = req['user']['username'];
        console.log(uname);
        email = '';
        pw = '';
        address = '';
        this.register_user(uname, pw, email, address, res);
        return res.redirect("/");
      }).bind(this));
      this.app.post('/register', (function(request, response) {
        var address, args, email, pw, uname;
        console.log("received /register post");
        args = request.query;
        uname = args['username'];
        console.log(uname);
        pw = args['password'];
        console.log(pw);
        email = args['email'];
        console.log(email);
        address = args['address'];
        console.log(address);
        return this.register_user(uname, pw, email, address, response);
      }).bind(this));
      this.app.post('/modify_address', (function(request, response) {
        var args;
        console.log("received /modify_address post");
        args = request.query;
        console.log(args);
        return this.register_address(args, response);
      }).bind(this));
      this.app.post('/modify_user', (function(request, response) {
        var address, args, email, username;
        console.log("received /modify_user post");
        args = request.query;
        console.log(args);
        username = args['username'];
        email = args['email'];
        address = args['address'];
        return this.modify_user(username, email, address, response);
      }).bind(this));
      this.app.get('/get_address_data', (function(request, response) {
        var addr, args;
        console.log("received get_address_data");
        args = request.query;
        addr = args['address'];
        console.log(addr);
        return this.request_address_data(addr, response);
      }).bind(this));
      this.app.get('/get_user_data', (function(request, response) {
        var args, uname;
        console.log("received get_user_data");
        args = request.query;
        uname = args['username'];
        console.log(uname);
        return this.request_user_data(uname, response);
      }).bind(this));
      this.app.post('/login', (function(req, res, next) {
        console.log("received /login post");
        return passport.authenticate('local', (function(error, user, info) {
          console.log('authentication callback');
          if (error) {
            console.log("auth error");
            return next(error);
          }
          if (!user) {
            return res.send({
              success: 'false',
              user_id: void 0,
              message: 'Login failed: ' + info
            });
          } else {
            return res.send({
              success: 'true',
              user_id: user,
              message: 'Login succeeded'
            });
          }
        }))(req, res, next);
      }));
      passport.use(new PassportLocalStrategy((function(username, password, done) {
        var onFailure, onSuccess, query;
        onSuccess = (function(rows) {
          if (rows === void 0 || rows.length !== 1) {
            console.log('fail - no user');
            return done(null, false, 'No account found or conflicting accounts.');
          } else if (rows[0].PASSWORD !== password) {
            console.log('fail - incorrect password');
            console.log(rows);
            console.log(password);
            return done(null, false, 'Incorrect password.');
          } else {
            console.log('success');
            return done(null, username);
          }
        });
        onFailure = (function(rows) {
          console.log('fail');
          return done(null, false, 'Bad user or password');
        });
        query = "SELECT PASSWORD FROM USERS WHERE USERNAME='" + username + "'";
        return this.mysql_query(query, onSuccess, onFailure);
      }).bind(this)));
      this.app.listen(this.port);
      process.on("uncaughtException", this.onUncaughtException);
      return this.mysql_connect();
    };

    HTTPRequestServer.prototype.mysql_connect = function() {
      /*
          @brief Establishes a connection with our sql database.
      */

      var conn_factory;
      conn_factory = new KettleSQL;
      this.conn = conn_factory.connect();
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
