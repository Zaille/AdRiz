/* eslint-env node */
'use strict';

// Ce module nodejs gère l'API de notre site
// Il définit l'ensemble des routes (relative à "/api") corresponant aux
// points d'entrée de l'API

// Expressjs
const express = require('express');
const formidable = require('formidable');
const path = require('path');
const dbHelper = require('./dbhelper.js');
const passwordHash = require('password-hash');
// https://github.com/validatorjs/validator.js#validators pour plus de check
const { body, param, validationResult } = require('express-validator');

// Comme c'est un module nodejs il faut exporter les fonction qu'on veut rendre publiques
// ici on n'exporte qu'ne seule fonction (anonyme) qui est le "constructeur" du module
// Cette fonction prend en paramètre un objet "passport" pour la gestion de l'authentification
module.exports = (passport) => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));

    app.get('/session', function (req, res) {

        // session remplie
        if (req.session.passport && req.session.passport.user) {
            res.json({ success: true, message: 'Session récupérée', ...req.session.passport.user });
        }
        else {
            res.json({ success: false });
        }

        res.end();
    });

    return app;
};





