
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var everyauth = require('everyauth');
var bcrypt = require('bcrypt');
var fs = require('fs');
var RedisStore = require('connect-redis')(express);

// Export app namespace
var app = module.exports = express();

// Db configuration
var Bookshelf  = require('bookshelf');

Bookshelf.sql = Bookshelf.initialize({
  client: 'sqlite3',
  connection: {
    filename : './db.sqlite3'
  }
});

// Models
var User = require('./models/user').User;


// Routes
//var user = require('./routes/api/user');

function createUser( userFields, callback ) {
  var user = new User(userFields);
  user.save();
  //First arg is error
  callback(null, user);
}

everyauth
  .everymodule
    .findUserById(function (id, callback) {
      new User({id : id})
        .fetch()
        .then(function( model ) {
          if ( model ) {
            callback(null, model);
          } else {
            callback("User not found", null);
          }
        });
    });

everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')

    .authenticate( function (login, password) {

      var errors = [],
          promise;

      if (!login) errors.push('Missing email');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;

      promise = this.Promise();

      User.findByEmail(login, function( user ) {

        if ( !user ) {
          console.log('error finding user');
          errors.push('User not found with email: ' + login);
          return promise.fulfill(errors);
        }

        bcrypt.compare(password, user.get('hash'), function( err, didMatch ) {

          if ( didMatch && !err ) {
            console.log('password did match');
            return promise.fulfill(user);
          } else {
            console.log('wrong password');
            errors.push('Wrong password.');
            return promise.fulfill(errors);
          }

        });

      });

      return promise;

    })

    .getRegisterPath('/register')
    .postRegisterPath('/register')

    .validateRegistration( function (newUserAttrs, errors) {
      var errors = [];
      var email = newUserAttrs.email;
      var promise = this.Promise();

      User.findByEmail(email, function( model ) {
        if ( model ) {
          errors.push('Email already taken');
        }
        return promise.fulfill(errors);
      });

      return promise;
    })

    .registerUser( function (newUserAttrs) {
      var promise = this.Promise(),
          email = newUserAttrs[this.loginKey()],
          password = newUserAttrs.password,
          salt;

      delete newUserAttrs.password;

      newUserAttrs.salt = salt = bcrypt.genSaltSync(10);
      newUserAttrs.hash = bcrypt.hashSync(password, salt);

      createUser( newUserAttrs, function (err, createdUser) {
        if (err) return promise.fail(err);
        return promise.fulfill(createdUser);
      });

      return promise;

    })

    .respondToLoginSucceed( function (res, user) {
      if ( user ) {
        res.json({ logged_in : true, user : user });
      }
    })

    .respondToLoginFail( function (req, res, errors) {
      if (!errors || !errors.length) return;
      res.json({ errors : errors });
    })

    .respondToRegistrationSucceed( function (req, res, user) {
      console.log('Registration successful');
      // maybe send 201
      res.json({ user : user});
    })

    .respondToRegistrationFail( function (req, res, errors) {
      console.log('Registration failed');
      res.json({ errors : errors });
    });








// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());


//Every auth stuff beloew. needs to be before routes
app.use(express.cookieParser());
app.use(express.session({
  secret: 'pressurezone',
  store: new RedisStore({
    // host:'127.0.0.1',
    // port:6380,
    prefix:'sess'
  })
}));

app.use(everyauth.middleware(app));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Require controllers

require('./controllers/conversations')(app);

app.get('/session', function( req, res ) {
  if ( req.user ) {
    res.send(req.user, 200);
  } else {
    res.send(401, "Session not found");
  }
});

app.get('/demo', function( req, res ) {
  var data = fs.readFileSync('./views/demo/index.html');
  res.set('Content-Type', 'text/html');
  res.send(data.toString());
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
