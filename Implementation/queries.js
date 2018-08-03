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
    getStudentsInCourse: getStudentsInCourse,
    getStudentsNotInCourse: getStudentsNotInCourse,
    getStudentsCourses: getStudentsCourses,
    getMaxUserId: getMaxUserId,
    createNewUser: createNewUser,
    createNewStudent: createNewStudent,
    createNewCourse: createNewCourse,
    addStudentToCourse: addStudentToCourse,
    updateCourse: updateCourse,
    deleteCourse: deleteCourse,
    updateUser: updateUser,
    deleteUser: deleteUser,
    updateStudent: updateStudent,
    removeStudentFromCourse: removeStudentFromCourse
};

function getMaxUserId(req, res, next){
    db.one('select max(userid) from users')
        .then(function(data){
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved max user id'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

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
    db.any('select * from students join users on students.userid = users.userid')
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
    db.any('select * from lecturers join users on lecturers.userid = users.userid')
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
    db.any('select * from courses')
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
    db.any('select assessments.*, coursecode from assessments, courses where assessments.courseid = courses.courseid')
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

function getStudentsInCourse(req, res, next) {
    var courseid = req.query.id;
     db.any('select * from students join users on students.userid = users.userid join enrolledin on students.studentid = enrolledin.studentid where enrolledin.courseid = $1', [courseid])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Students In Course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getStudentsNotInCourse(req, res, next) {
    var courseid = req.query.id;
    db.any('select students.*, users.* from students join users on students.userid = users.userid left join enrolledin on students.studentid = enrolledin.studentid where students.studentid not in (select studentid from enrolledin where courseid = $1)', [courseid])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Students Not In Course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getStudentsCourses(req, res, next){
    var studentid = req.query.studentid;
    db.any('select * from courses join enrolledin on courses.courseid = enrolledin.courseid and enrolledin.studentid = $1', [studentid])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Students Not In Course'
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
    db.none('insert into users(username, name, password) values($1,$2,$3)', [username, name, password])
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
    var userid = req.body.params.userid;
    var studentid = req.body.params.studentid;
    db.none('insert into students(userid, studentid) values($1, $2)', [userid, studentid])
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

function addStudentToCourse(req, res, next){
    var studentid = req.body.params.studentid;
    var courseid = req.body.params.courseid;
    db.none('insert into enrolledin(studentid, courseid) values($1, $2)', [studentid, courseid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Added student to course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createNewCourse(req, res, next){
    var courseCode = req.body.params.coursecode;
    db.none('insert into courses(coursecode) values($1)', [coursecode])
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
    db.none('update courses set coursecode = $1 where courseid = $2', [coursecode, id])
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
    db.none('delete from courses where courseid = $1', [id])
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

function updateUser(req, res, next){
    var userid = req.body.params.userid;
    var username = req.body.params.username;
    var name = req.body.params.name;
    var password = req.body.params.password;
    db.none('update users set username = $1, name = $2, password = $3 where userid = $4', [username, name, password, userid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated User'
                });

        })
        .catch(function (err) {
            return next(err);
        });
}

function deleteUser(req, res, next){
    var userid = req.body.params.userid;
    db.none('delete from users where userid = $1', [userid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted User'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function updateStudent(req, res, next){
    var studentid = req.body.params.studentid;
    var userid = req.body.params.userid;
    db.none('update students set studentid = $1 where userid = $2', [studentid, userid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated Student'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function removeStudentFromCourse(req, res, next){
    var studentid = req.body.params.studentid;
    var courseid = req.body.params.courseid;
    db.none('delete from enrolledin where studentid = $1 and courseid = $2', [studentid, courseid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Removed User From Course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}