/* eslint-env node */
'use strict';

// This module alows connection to a mysql/mariadb dadtabase
const mysql = require('mysql');

const dbCon = mysql.createConnection({
    host: 'localhost',
    user: 'admin',           // maybe too much privilege
    password: 'password',    // for internal testing purposes only !!
    database: 'adrizdb',
    multipleStatements: true, // security hole if not using prepared queries !!
});

// Connection to the database.
dbCon.connect(function (err) {
    if (err) {
        throw err;
    }
    console.log('Connected to database!');
});

// Callback function to promise
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

// --------------------------------------------------------------------------

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
