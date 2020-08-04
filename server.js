'use strict';

const express = require('express');
const app = express();
const api = require('./api.js');
const auth = require('./auth.js');
const passport = auth(app);

app.use('/api', api(passport));
app.use('/public', express.static('public'));
app.use('/private', require('connect-ensure-login').ensureLoggedIn(),
    express.static('private'),
);

app.get('/logout', function (req, res) {
    res.sendFile('public/logout.html', {'root': __dirname});
});

app.get('/supprime_session', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('*', function (req, res) {
    res.sendFile('public/index.html', {'root': __dirname});
});

const server = app.listen(8080, function () {
    let port = server.address().port;
    console.log('My app is listening at http://127.0.0.1:%s', port);
});

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