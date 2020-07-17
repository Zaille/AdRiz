/* eslint-env node */
'use strict';

// Ce module permet de gérer l'authentification avec la librairie passportjs
// Il dépend également du module dbHelper puisque les informations de nos
// utilisateurs sont stockées dans la base de données

////////////////////////////////////////////
// CONFIG

const admin_password = 'admin1';
const admin_username = 'admin';

////////////////////////////////////////////


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const dbHelper = require('./dbhelper.js');
const passwordHash = require('password-hash');

// LocalStrategy = stockage des identifiants et mots de passe
// des utilisateurs en local dans notre base de données
passport.use(new LocalStrategy(
    function (username, password, cb) {
        // On récupère les information (mot de passe) de l'utilisateur
        // passé en paramètre

        // gestion de l'administrateur originel
        if (username === admin_username) {
            if (passwordHash.verify(password, passwordHash.generate(admin_password))) {
                cb(null, {type: 1});
                return;
            }
            else {
                cb(null, false);
                return;
            }
        }

        dbHelper.users.byUsername(username)
            .then((rows) => {
                // Utilisateur pas dans la base de données
                if (rows.result.length !== 1) {
                    cb(null, false);
                }
                else if (passwordHash.verify(password, rows.result[0].password)) {
                    // Utilisateur dans la base de données et mot de passe ok
                    // dans le cas de l'admin, traitement d'un admin non originel
                    // if admin
                    if (rows.result[0].type === 1) {
                        cb(null, {type: rows.result[0].type});
                    }
                    else if (rows.result[0].type === 2) {
                        // if teacher
                        dbHelper.professeur.byUserId(rows.result[0].id)
                            .then((elem) => {
                                cb(null, elem.result[0]);
                            });
                    }
                    else if (rows.result[0].type === 3) {
                        // if student
                        dbHelper.etudiant.byUserId(rows.result[0].id)
                            .then((elem) => {
                                cb(null, elem.result[0]);
                            });
                    }
                }
                else {
                    // Utilisateur dans la base de données mais mauvais mot de passe
                    cb(null, false);
                }
            }, err => cb(err));
    },
));

// Stocke les données de l'utilisation dans la session
passport.serializeUser(function (user_session, cb) {
    // pas de modification de la session,  nous gardons les informations récuprées durant le login
    cb(null, user_session);
});

// Récupère les données de l'utilisateur depuis la session
passport.deserializeUser(function (user_session, cb) {


    cb(null, user_session);
});

// Puisque c'est un module, on export au moins une fonction
// Ici c'est un "constructeur" qui prend une application express
// en paramètre afin de se déclarer comme middlewwre et pouvoir gérer
// l'authentification sur toutes les routes du site
module.exports = function (app) {
    app.use(require('cookie-parser')());
    app.use(require('body-parser').urlencoded({extended: true}));
    app.use(require('express-session')({
        secret: '335168427281550942558874596817021745493361659792786727130465314100646280159669855912074179323195635128975738471722436311998661821090372618672360773865293922854984524342349588135783484469197640',
        resave: false,
        saveUninitialized: false,
        key: 'jsucks',
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: null, // session cookie, supprimé quand browser fermé
        },
    }));

    // Initialize Passport and restore authentication state, if any, from the
    // session.
    app.use(passport.initialize());
    app.use(passport.session());

    return passport;
};
