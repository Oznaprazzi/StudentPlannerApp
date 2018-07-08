const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/studentplannerdb';

function getID(res) {
    pg.connect(connectionString, (err, client, done) => {
        console.log("in here");
        client.query("SELECT userid FROM users ORDER BY userid DESC \n" +
            "LIMIT 1",

            function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(result);
                    res.send(result);
                }
            }
        );
    });
}


router.post('/createNewStudent', function (req, res) {
    var name = req.body.params.name;
    var password = req.body.params.password;
    pg.connect(connectionString, (err, client, done) => {
        client.query('INSERT INTO users(name,password) values($1,$2)',
            [name, password],
            function (err, result) {

                if (err) {
                    console.log(err.message);
                    return res.status(500);
                }
                else {
                    var query = client.query("SELECT userid FROM users ORDER BY userid DESC \n" +
                        "LIMIT 1");
                    query.on('error', function (err) {
                        //
                    })
                        .on('fields', function(fields) {
                            // the field packets for the rows to follow
                        })
                        .on('result', function(row) {
                            // Do some stuff
                        })
                        .on('end', function(err, result) {
                         //client.query('INSERT INTO student(userid) values($1)', [query]);
                           var len = result.length();
                            for (i = 0; i < len; i += 1) {
                                console.log(result[i]);
                            }
                        });
                    // res.render('index', {title: 'Student Planner'},
                    //     function (err, html) {
                    //

                    //     });


                    //res.render('index', { title: 'Student Planner' });
                    console.log("here");
                }

            });

        console.log("hereeeeeeeeeeee" + getID(res));
        /*var userid = client.query("SELECT userid FROM users ORDER BY userid DESC \n" +
            "LIMIT 1");*/
        // client.query('INSERT INTO student(userid) values($1)',
        //     [getID(res)]);

    });
});


router.get('/getUsers', (req, res, next) => {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM users;');
        // Stream results back one row at a time
        query.on('row', (row) => {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.json(results);
        });
    });
});

router.get('/getLecturers', (req, res, next) => {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM lecturer;');
        // Stream results back one row at a time
        query.on('row', (row) => {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return res.json(results);
        });
    });
});


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Student Planner'});
});
module.exports = router;
