/* eslint-env node */
'use strict';

// TODO : Revoir les return apres les 'then()'

// Ce module nodejs gère l'API de notre site
// Il définit l'ensemble des routes (relative à "/api") corresponant aux
// points d'entrée de l'API

// Expressjs
const express = require('express');
const dbHelper = require('./dbhelper.js');
const { body, validationResult } = require('express-validator');
const cors = require('cors');

// Comme c'est un module nodejs il faut exporter les fonction qu'on veut rendre publiques
// ici on n'exporte qu'ne seule fonction (anonyme) qui est le "constructeur" du module
// Cette fonction prend en paramètre un objet "passport" pour la gestion de l'authentification
module.exports = () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));

    const corsOptions = {
        origin: 'https://adriz-test.web.app',
        methods: ["GET", "HEAD", "OPTION", "PUT", "PATCH", "POST", "DELETE"],
        credentials: true,
        maxAge: 3600,
        allowedHeaders: ["sessionId", "Origin", "Content-Type", "Authorization", "X-Requested-With", "Accept"],
        // exposedHeaders: ["sessionId"],
        // preflightContinue: false
    }

    // app.use(cors(corsOptions));
    app.use((req, res, next) => {
        const allowedOrigins = [
            "https://adriz-test.web.app",
            "https://adriz-test.firebaseapp.com"
        ];
        const origin = req.headers.origin;
        if(allowedOrigins.indexOf(origin) > -1){
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        return next();
    });

    // app.options('/newsletter');
    app.post('/newsletter', [
        body('mail', 'Mail invalide').exists().isLength({ min: 1, max: 100 })
    ], (req, res) => {

        console.log(`Origin : ${req.headers.origin}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        dbHelper.newsletter.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.data().mail);
                if( doc.data().mail === req.body.mail ) {
                    return res.status(423).json(body('mail', 'Mail déjà inscrit à la newsletter'));
                }
            });
            return res.end();
        }).then(() => {
            return dbHelper.newsletter.new( req.body.mail );
        }).catch((err) => {
            return res.status(400).json({err})
        });
    });

    app.post('/contact', [
        body('nom', 'Nom invalide').exists().isLength({ min: 1, max: 100 }),
        body('prenom', 'Prenom invalide').exists().isLength({ min: 1, max: 100 }),
        body('mail', 'Mail invalide').exists().isLength({ min: 1, max: 100 }),
        body('message', 'Message invalide').exists().isLength({ min: 1, max: 255 }),
    ], (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json(errors.array());
        }

        dbHelper.contact.new(
            req.body.nom,
            req.body.prenom,
            req.body.mail,
            req.body.message,
            ).then(() => {
                return res.end();
            }).catch((err) => res.status(400).json({ err }));
    });

    return app;
};





