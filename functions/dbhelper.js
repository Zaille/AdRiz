'use strict';

const firebase = require('firebase-admin');
const functions = require('firebase-functions');

firebase.initializeApp({
    apiKey: functions.config().envs.apikey,
    authDomain: functions.config().envs.authdomain,
    databaseURL: functions.config().envs.databaseurl,
    projectId: functions.config().envs.projectid,
    storageBucket: functions.config().envs.storagebucket,
    messagingSenderId: functions.config().envs.messagingsenderid
});

let firestore = firebase.firestore();

/**********************************************************/

module.exports.newsletter = {
    new: (mail) => firestore.collection("newsletter").add({
        mail: mail
    }),

    get: () => firestore.collection("newsletter").get().then((querySnapshot) => {
        return querySnapshot;
    })
};

module.exports.contact = {
    new: (nom, prenom, mail, message) => firestore.collection("contact").add({
        nom: nom,
        prenom: prenom,
        mail: mail,
        message: message
    })
};
