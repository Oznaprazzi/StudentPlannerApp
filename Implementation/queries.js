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
    getMaxUserId: getMaxUserId,
    getMaxLecturerId: getMaxLecturerId,

    getUsers: getUsers,
    getStudents: getStudents,
    getLecturers: getLecturers,
    getCourses: getCourses,
    getAssessments: getAssessments,
    getTasks: getTasks,

    getStudentsInCourse: getStudentsInCourse,
    getStudentsNotInCourse: getStudentsNotInCourse,
    getStudentsCourses: getStudentsCourses,
    getLecturersCourses: getLecturersCourses,

    createNewUser: createNewUser,
    createNewStudent: createNewStudent,
    createNewLecturer: createNewLecturer,
    createNewCourse: createNewCourse,
    createNewAssessment: createNewAssessment,
    createNewTask: createNewTask,

    addStudentToCourse: addStudentToCourse,
    addLecturerCourses: addLecturerCourses,

    updateCourse: updateCourse,
    updateUser: updateUser,
    updateStudent: updateStudent,
    updateLecturer: updateLecturer,
    updateAssessment: updateAssessment,
    updateTask: updateTask,

    deleteCourse: deleteCourse,
    deleteUser: deleteUser,
    deleteAssessment: deleteAssessment,
    deleteTask: deleteTask,

    removeStudentFromCourse: removeStudentFromCourse,
    removeLecturerCourse: removeLecturerCourse
};

/***************************/
/*********Get IDs**********/
/***************************/

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

function getMaxLecturerId(req, res, next){
    db.one('select max(lecturerid) from lecturers')
        .then(function(data){
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved max lecturer id'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/*****Get Original Lists****/
/***************************/

function getUsers(req, res, next) {
    db.any('select * from users order by userid asc')
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
    db.any('select * from students join users on students.userid = users.userid order by students.userid asc')
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
    db.any('select * from lecturers join users on lecturers.userid = users.userid order by lecturers.userid asc')
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
    db.any('select * from courses order by courseid asc')
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
    var courseid = req.query.courseid;
    db.any('select assessments.*, courses.coursecode from assessments join courses on assessments.courseid = courses.courseid where assessments.courseid = $1 order by assessments.assessmentid asc;', [courseid])
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

function getTasks(req, res, next){
    var assessmentid = req.query.assessmentid;
    db.any('select * from tasks join assessments on tasks.assessmentid = assessments.assessmentid where tasks.assessmentid = $1 order by tasks.taskid asc;', [assessmentid])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Tasks For Requested Assessment'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/******Get Join Lists*******/
/***************************/

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
                    message: 'Retrieved ALL Student\'s courses'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getLecturersCourses(req, res, next){
    var lecturerid = req.query.lecturerid;
    db.any('select * from courses join taughtby on courses.courseid = taughtby.courseid and taughtby.lecturerid = $1', [lecturerid])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Lecturer\'s courses'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/********Create New*********/
/***************************/

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

function createNewLecturer(req, res, next){
    var userid = req.body.params.userid;
    db.none('insert into lecturers(userid) values($1)', [userid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Created new lecturer'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createNewCourse(req, res, next){
    var coursecode = req.body.params.coursecode;
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

function createNewAssessment(req, res, next){
    var courseid = req.body.params.courseid;
    var assessmenttype = req.body.params.assessmenttype;
    var startDate = req.body.params.startDate;
    var dueDate = req.body.params.dueDate;
    var title = req.body.params.title;
    var details = req.body.params.details;
    db.none('insert into assessments(courseid, assessmentType, startDate, dueDate, title, details) values($1, $2, $3, $4, $5, $6)', [courseid, assessmenttype, startDate, dueDate, title, details])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Created new assessment'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function createNewTask(req, res, next){
    var assessmentid = req.body.params.assessmentid;
    var description = req.body.params.description;
    var points = req.body.params.points;
    db.none('insert into tasks(assessmentid, description, points) values($1, $2, $3)', [assessmentid, description, points])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Created new task'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/**********Add To***********/
/***************************/

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

function addLecturerCourses(req, res, next){
    var lecturerid = req.body.params.lecturerid;
    var courseid = req.body.params.courseid;
    db.none('insert into taughtby(lecturerid, courseid) values($1, $2)', [lecturerid, courseid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Added lecturer\'s course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/**********Update***********/
/***************************/

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

function updateLecturer(req, res, next) {
    var lecturerid = req.body.params.lecturerid;
    var userid = req.body.params.userid;
    db.none('update lecturers set lecturerid = $1 where userid = $2', [lecturerid, userid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated Lecturer'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function updateAssessment(req, res, next) {
    var assessmentid = req.body.params.assessmentid;
    var courseid = req.body.params.courseid;
    var assessmenttype = req.body.params.assessmenttype;
    var dueDate = req.body.params.dueDate;
    var title = req.body.params.title;
    var details = req.body.params.details;
    db.none('update assessments set courseid = $1, assessmentType = $2, dueDate = $3, title = $4, details = $5 where assessmentid = $6', [courseid, assessmenttype, dueDate, title, details, assessmentid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated assessment'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function updateTask(req, res, next){
    var taskid = req.body.params.taskid;
    var description = req.body.params.description;
    var points = req.body.params.points;
    db.none('update tasks set description = $1, points = $2 where taskid = $3', [description, points, taskid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated task'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/**********Delete***********/
/***************************/

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

function deleteAssessment(req, res, next){
    var assessmentid = req.body.params.assessmentid;
    db.none('delete from assessments where assessmentid = $1', [assessmentid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted Assessment'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function deleteTask(req, res, next){
    var taskid = req.body.params.taskid;
    db.none('delete from tasks where taskid = $1', [taskid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Deleted Task'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/**********Remove***********/
/***************************/

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

function removeLecturerCourse(req, res, next){
    var lecturerid = req.body.params.studentid;
    var courseid = req.body.params.courseid;
    db.none('delete from taughtby where lecturerid = $1 and courseid = $2', [lecturerid, courseid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Removed Lecturer\'s Course'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}