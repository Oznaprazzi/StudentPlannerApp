var promise = require('bluebird');

var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/studentplannerdb';
var db = pgp(connectionString);

// add query functions

module.exports = {
    getUsers: getUsers,
    getStudents: getStudents,
    getLecturers: getLecturers,
    getCourses: getCourses,
    createNewUser: createNewUser,
    createNewStudent: createNewStudent,
    createNewCourse: createNewCourse
};

function getUsers(req, res, next) {
    db.any('select * from users')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Users'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getStudents(req, res, next) {
    db.any('select * from student')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Students'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getLecturers(req, res, next) {
    db.any('select * from lecturer')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Lecturers'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getCourses(req, res, next){
    db.any('select * from course')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Courses'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createNewUser(req, res, next){
    var name = req.body.params.name;
    var password = req.body.params.password;
    db.none('insert into users(name,password) values($1,$2)', [name, password])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Created new user'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createNewStudent(req, res, next){
    db.one('select max(userid) from users')
        .then(function (data) {
            db.none('insert into student(userid) values($1)', [data.max])
                .then(function () {

                    res.status(200)
                        .json({
                            status: 'success',
                            message: 'Created new student'
                        });
                })
                .catch(function (err) {
                    return next(err);
                });
        })
        .catch(function (err) {
            console.log(err);
        });
}

function createNewCourse(req, res, next){
    var courseCode = req.body.params.courseCode;
    db.none('insert into course(coursecode) values($1)', [courseCode])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Created new course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

