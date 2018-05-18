var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = "postgres://root:123456@localhost/studentplannerdb";
var pool = new pg.Pool(connectionString);

pool.on('error', function (err, client) {
    console.error('Client error', err.message, err.stack);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Casey' });
});

router.get('/gettemp', function(req,res){
    pool.query("SELECT * from temp", function (err, result) {
        if(err){
            console.log(err.message);
            return res.status(500);
        }else {
            console.log("result "+result);
            res.send(result);
        }
    })
});

module.exports = router;
