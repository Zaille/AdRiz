'use strict';

const mysql = require('mysql');
const dbCon = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'password',
    database: 'adrizdb',
    multipleStatements: true,
});

dbCon.connect(function (err) {
    if (err) throw err;
    console.log('Connected to database!');
});

const cbToPromise = function (fn, ...args) {
    return new Promise(function (resolve, reject) {
        fn(...args, (err, res, fields) => {
            if (err) {
                /* return */
                reject(err);
            }
            else {
                /* return */
                resolve({'result': res, 'fields': fields}); // return not needed, implicit ?
            }
        });
    });
};

const prepareQuery = function (unformated_query, inserts) {
    return mysql.format(unformated_query, inserts);
};

const query = function (sql_query) {
    return cbToPromise(dbCon.query.bind(dbCon), sql_query);
};

/**********************************************************/

module.exports.newsletter = {
    new: (mail) => query(prepareQuery(`
        INSERT INTO 
            newsletter (mail)
        VALUES 
            (?);`, [mail]
    ))
};

module.exports.contact = {
    new: (nom, prenom, mail, message) => query(prepareQuery(`
        INSERT INTO 
            contact (nom, prenom, mail, message)
        VALUES 
            (?, ?, ?, ?);`, [nom, prenom, mail, message]
    ))
};

/**********************************************************/

module.exports.atExit = function (options, exitCode) {

    if (options.cleanup) {
        console.log('Cleaning up..');
        dbCon.end();
        console.log('Done !');
    }

    if (exitCode || exitCode === 0) {
        console.log('Exit signal: ', exitCode);
    }

    if (options.exit) {
        console.log('Forcing exit !');
        process.exit();
    }
};
