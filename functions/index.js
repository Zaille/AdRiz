'use strict';

// const rateLimit = require('express-rate-limit');
const functions = require('firebase-functions');
const express = require('express');

// const api = require('./api.js');

const app = express();

// app.use('/api', api());
app.use('/public', express.static('../public'));

app.use(require('cors')());
// app.use(require('cookie-parser')());
// app.use(require('helmet')());
// app.use(require('body-parser').urlencoded({extended: true}));
// app.use(require('express-session')({
//   secret: '335168427281550942558874596817021745493361659792786727130465314100646280159669855912074179323195635128975738471722436311998661821090372618672360773865293922854984524342349588135783484469197640',
//   resave: false,
//   saveUninitialized: false,
//   key: 'jsucks',
//   cookie: {
//     path: '/',
//     httpOnly: true,
//     maxAge: null, // session cookie, supprimé quand browser fermé
//     secure: true,
//     expires: new Date( Date.now() + 3600 ),
//     // domain: 'adriz.fr', TODO
//   },
// }));

/*const limiter = rateLimit({
  path: '*',
  method: 'all',
  total: 2,
  expire: 10,
  message: 'La page a été rechargée trop de fois. Pour des raisons de sécurité, nous avons dû vous bloquer le ' +
      'chargement de la page pour une durée de X minutes. Veuillez rééssayer ultérieurement.'
});*/

app.get('*', function (req, res) {
  res.sendFile('public/index.html', {'root': __dirname});
});

exports.app = functions.region('europe-west1').https.onRequest(app);

/**********************************************************/

const runAtExit = function (options, exitCode) {
  require('./dbhelper.js').atExit(options, exitCode);
};

const registerAtExit = function () {
  // Do something when app is closing
  process.on('exit', runAtExit.bind(null, {cleanup: true}));

  // Catches ctrl+c event
  process.on('SIGINT', runAtExit.bind(null, {exit: true}));

  // Catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', runAtExit.bind(null, {exit: true}));
  process.on('SIGUSR2', runAtExit.bind(null, {exit: true}));

  // Catches uncaught exceptions
  process.on('uncaughtException', runAtExit.bind(null, {exit: true}));
};

registerAtExit();
