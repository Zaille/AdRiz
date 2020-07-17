/* eslint-env node */
'use strict';

// Ceci est notre scirpt principal, celui qui va lancer le serveur web

// imports d'express
const express = require('express');
const app = express();
// et de nos modules à nous !
const api = require('./api.js');
const auth = require('./auth.js');

// on met en place une authentification valide pour tout le site
const passport = auth(app);

// l'api d'accès aux données sera disponible sous la route "/api"
app.use('/api', api(passport));

// Le contenu statique public sera lu à partir du repertoire 'public'
app.use('/public', express.static('public'));

// Le contenu statique privé sera lu à partir du repertoire 'private'
// dans cet exemple, il s'agit principalement des templates de la partie admin
// on vérifie ici que l'utilisateur est bien authentifié
app.use('/private', require('connect-ensure-login').ensureLoggedIn(),
    express.static('private'),
);

// Gestion des déconnection. La page supprime la session client et le serveur détruit
// la session serveur.
app.get('/logout', function (req, res) {
    res.sendFile('public/logout.html', {'root': __dirname});
});

app.get('/supprime_session', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Pour toutes les autres url (catch all) on renverra l'index.html
// c'est le routeur coté client qui fera alors le routing
app.get('*', function (req, res) {
    res.sendFile('public/index.html', {'root': __dirname});
});

// Lancement du serveur web
const server = app.listen(8080, function () {
    let port = server.address().port;
    console.log('My app is listening at http://127.0.0.1:%s', port);
});

// -----------------------------------------------------------------------------

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