'use strict';

const rateLimit = require('express-rate-limit');
const functions = require('firebase-functions');
const express = require('express');
const api = require('./api.js');
// const cors = require('cors');

const app = express();

/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});*/

app.use('/api', api());
app.use('/public', express.static('../public'));

app.use(require('cookie-parser')());
app.use(require('helmet')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({
  secret: '335168427281550942558874596817021745493361659792786727130465314100646280159669855912074179323195635128975738471722436311998661821090372618672360773865293922854984524342349588135783484469197640',
  resave: false,
  saveUninitialized: false,
  key: 'jsucks',
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: null,
    secure: true,
    domain: 'https://adriz-test.web.app',
    sameSite: 'strict'
  },
}));

const limiter = rateLimit({
  path: '*',
  method: 'all',
  total: 5,
  expire: 10,
  message: 'La page a été rechargée trop de fois. Pour des raisons de sécurité, nous avons dû vous bloquer le ' +
      'chargement de la page pour une durée de X minutes. Veuillez rééssayer ultérieurement.'
});

app.get('*', limiter, (req, res) => {
  res.sendFile('public/index.html', {'root': __dirname});
});

exports.app = functions.region('europe-west1').https.onRequest(app);
