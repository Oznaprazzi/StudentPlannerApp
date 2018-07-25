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
    getAssessments: getAssessments,
    createNewUser: createNewUser,
    createNewStudent: createNewStudent,
    createNewCourse: createNewCourse,
    updateCourse: updateCourse,
    deleteCourse: deleteCourse
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
    db.any('select * from student join users on student.userid = users.userid')
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
    db.any('select * from lecturer join users on lecturer.userid = users.userid')
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

function getAssessments(req, res, next){
    db.any('select assessment.*, coursecode from assessment, course where assessment.courseid = course.courseid')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Assessments'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createNewUser(req, res, next){
    var username = req.body.params.username;
    var name = req.body.params.name;
    var password = req.body.params.password;
    db.none('insert into users(username, name,password) values($1,$2)', [username, name, password])
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
    var username = req.body.params.username;
    var studentid = req.body.params.studentid;
    db.none('insert into student(username, studentid) values($1, $2)', [username, studentid])
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

function updateCourse(req, res, next){
    var coursecode = req.body.params.coursecode;
    var id = req.body.params.id;
    db.none('update course set coursecode = $1 where courseid = $2', [coursecode, id])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function deleteCourse(req, res, next){
    var id = req.body.params.id;
    db.none('delete from course where courseid = $1', [id])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

