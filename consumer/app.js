'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const config = require('./config');

// Express configuration
const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());
app.use(session({ secret: 'keyboard dog', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.
//   Typically, this will be as simple as storing the user ID when serializing,
//   and finding the user by ID when deserializing.
//   However, since this example does not have a database of user records,
//   the complete user profile is serialized and deserialized.
passport.serializeUser((user, done) =>  done(null, user));
passport.deserializeUser((user, done) => {
  done(error, user);
});

passport.use('oauth2-example', new OAuth2Strategy({
    authorizationURL: config.oauth2ServerBaseUrl + config.authorizationUrl,
    tokenURL: config.oauth2ServerBaseUrl + config.tokenUrl,
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackUrl
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
  }
));

app.get('/', (req, res, next) => res.render('index'));
app.get('/login', (req, res, next) => res.render('login'));

app.get('/auth/oauth2-example', passport.authenticate('oauth2-example'));
app.get('/auth/oauth2-example/callback', (req, res) => {
  // Successful authentication, redirect home.
  res.redirect('/');
});

const port = process.argv[2] || 3002;
app.listen(port, function() {
  console.log('OAuth2 provider is listening on port ' + port);
});
