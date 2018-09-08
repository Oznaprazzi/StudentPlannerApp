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
    getMaxTaskId: getMaxTaskId,
    getMaxAssessmentId: getMaxAssessmentId,
    getMaxCouponId: getMaxCouponId,

    getUsers: getUsers,
    getStudents: getStudents,
    getLecturers: getLecturers,
    getCourses: getCourses,
    getAssessments: getAssessments,
    getTasks: getTasks,
    getCoupons: getCoupons,

    getStudentsInCourse: getStudentsInCourse,
    getStudentsNotInCourse: getStudentsNotInCourse,
    getStudentsCourses: getStudentsCourses,
    getLecturersCourses: getLecturersCourses,
    getStudentTasks: getStudentTasks,
    getStudentCoupons: getStudentCoupons,

    createNewUser: createNewUser,
    createNewStudent: createNewStudent,
    createNewLecturer: createNewLecturer,
    createNewCourse: createNewCourse,
    createNewAssessment: createNewAssessment,
    createNewTask: createNewTask,
    createNewCoupon: createNewCoupon,

    addStudentToCourse: addStudentToCourse,
    addLecturerCourses: addLecturerCourses,
    addToCompleteTask: addToCompleteTask,
    addToCompleteAssessment: addToCompleteAssessment,
    addCouponToStudent: addCouponToStudent,

    updateCourse: updateCourse,
    updateUser: updateUser,
    updateStudent: updateStudent,
    updateLecturer: updateLecturer,
    updateAssessment: updateAssessment,
    updateTask: updateTask,
    updateTaskCompleted: updateTaskCompleted,
    updateStudentPoints: updateStudentPoints,
    updateStudentCouponsGet: updateStudentCouponsGet,
    updateStudentCouponsUse: updateStudentCouponsUse,

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

function getMaxUserId(req, res, next) {
    db.one('select max(userid) from users')
        .then(function (data) {
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

function getMaxLecturerId(req, res, next) {
    db.one('select max(lecturerid) from lecturers')
        .then(function (data) {
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

function getMaxTaskId(req, res, next) {
    db.one('select max(taskid) from tasks')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved max task id'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getMaxAssessmentId(req, res, next) {
    db.one('select max(assessmentid) from assessments')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved max assessment id'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getMaxCouponId(req, res, next){
    db.one('select max(couponid) from coupons')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved max coupon id'
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

function getCourses(req, res, next) {
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

function getAssessments(req, res, next) {
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

function getTasks(req, res, next) {
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

function getCoupons(req, res, next) {
    db.any('select * from coupons order by couponid asc;')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Coupons'
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

function getStudentsCourses(req, res, next) {
    var studentid = req.query.studentid;
    db.any('select * from courses join enrolledin on courses.courseid = enrolledin.courseid and enrolledin.studentid = $1 order by courses.courseid asc', [studentid])
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

function getLecturersCourses(req, res, next) {
    var lecturerid = req.query.lecturerid;
    db.any('select * from courses join taughtby on courses.courseid = taughtby.courseid and taughtby.lecturerid = $1 order by courses.courseid asc', [lecturerid])
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

function getStudentTasks(req, res, next) {
    var studentid = req.query.studentid;
    var assessmentid = req.query.assessmentid;
    db.any('select * from tasks join completestask on tasks.taskid = completestask.taskid and completestask.studentid = $1 and tasks.assessmentid = $2 order by task.taskid asc', [studentid, assessmentid])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Student\'s tasks for current assessment'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getStudentCoupons(req, res, next) {
    var studentid = req.query.studentid;
    db.any('select * from studentcoupons join coupons on studentcoupons.couponid = coupons.couponid and studentcoupons.studentid = $1 order by studentcoupons.scouponid asc', [studentid])
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Retrieved ALL Student\'s coupons'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/********Create New*********/

/***************************/

function createNewUser(req, res, next) {
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

function createNewStudent(req, res, next) {
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

function createNewLecturer(req, res, next) {
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

function createNewCourse(req, res, next) {
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

function createNewAssessment(req, res, next) {
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

function createNewTask(req, res, next) {
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

function createNewCoupon(req, res, next) {
    var amount = req.body.params.amount;
    var points = req.body.params.points;
    db.none('insert into coupons(amount, points) values($1, $2)', [amount, points])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Created new coupon'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/**********Add To***********/

/***************************/

function addStudentToCourse(req, res, next) {
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

function addLecturerCourses(req, res, next) {
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

function addToCompleteTask(req, res, next) {
    var studentid = req.body.params.studentid;
    var taskid = req.body.params.taskid;
    db.none('insert into completestask(studentid, taskid) values($1, $2)', [studentid, taskid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Linked task to student'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function addToCompleteAssessment(req, res, next) {
    var studentid = req.body.params.studentid;
    var assessmentid = req.body.params.assessmentid;
    db.none('insert into completesassessment(studentid, assessmentid) values($1, $2)', [studentid, assessmentid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Linked assessment to student'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function addCouponToStudent(req, res, next) {
    var studentid = req.body.params.studentid;
    var couponid = req.body.params.couponid;
    db.none('insert into studentcoupons(studentid, couponid) values($1, $2)', [studentid, couponid])
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Linked coupon to student'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

/***************************/
/**********Update***********/
/***************************/

function updateCourse(req, res, next) {
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

function updateUser(req, res, next) {
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

function updateStudent(req, res, next) {
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

function updateTask(req, res, next) {
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

function updateTaskCompleted(req, res, next) {
    var taskid = req.body.params.taskid;
    var studentid = req.body.params.studentid;
    var completed = req.body.params.completed;
    db.none('update completestask set completed = $1 where taskid = $2 and studentid = $3', [completed, taskid, studentid])
        .then(function () {
            db.one('select assessments.assessmentid from assessments join tasks on assessments.assessmentid =' +
                ' tasks.assessmentid where tasks.taskid = $1', [taskid]) //gets associated assessmentid
                .then(function (data) {
                    db.any('select assessments.assessmentid,  completestask.completed from assessments join tasks on assessments.assessmentid = tasks.assessmentid join completestask on completestask.taskid = tasks.taskid where completestask.studentid = $1 and assessments.assessmentid = $2;', [studentid, data.assessmentid])
                        .then(function (data) {
                            if (allTasksCompleted(data)) { //student has completed all tasks associated with the assessment
                                db.none('update completesassessment set completed = true where assessmentid = $1 and studentid = $2', [data[0].assessmentid, studentid])
                                    .then(function () {
                                        res.status(200)
                                            .json({
                                                status: 'success',
                                                message: 'Updated task points'
                                            });
                                    })
                                    .catch(function (err) {
                                        return next(err);
                                    });
                            } else {
                                db.none('update completesassessment set completed = false where assessmentid = $1 and studentid = $2', [data[0].assessmentid, studentid])
                                    .then(function () {
                                        res.status(200)
                                            .json({
                                                status: 'success',
                                                message: 'Updated task points'
                                            });
                                    })
                                    .catch(function (err) {
                                        return next(err);
                                    });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                })
                .catch(function (err) {
                    return next(err);
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

//Check if student has completed all tasks
function allTasksCompleted(data) {
    for (let i = 0; i < data.length; i++) {
        if (!data[i].completed) {
            return false;
        }
    }
    return true;
}

function updateStudentPoints(req, res, next) {
    var points = req.body.params.points;
    var studentid = req.body.params.studentid;
    var completed = req.body.params.completed;
    db.one('select points from students where studentid = $1', [studentid])
        .then(function (data) {
            var totalPoints = data.points;
            if (completed) {
                totalPoints += points;
            } else {
                totalPoints -= points;
            }
            db.none('update students set points = $1 where studentid = $2', [totalPoints, studentid])
                .then(function () {
                    res.status(200)
                        .json({
                            status: 'success',
                            message: 'Updated student points'
                        });
                })
                .catch(function (err) {
                    return next(err);
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function updateStudentCouponsGet(req, res, next) {
    var couponid = req.body.params.couponid;
    var studentid = req.body.params.studentid;
    var scouponid = req.body.params.scouponid;
    db.one('select points from coupons where couponid = $1', [couponid]) //get coupon points to deduct from student's points
        .then(function (data) {
            var cpoints = data.points;
            db.none('update studentcoupons set owned = true where scouponid = $1', [scouponid]) //student now owns the coupon
                .then(function () {
                    db.one('select points from students where studentid = $1', [studentid]) //get student's points
                        .then(function (data) {
                            var spoints = data.points;
                            db.none('update students set points = $1 where studentid = $2', [spoints - cpoints, studentid]) //deduct coupon points from student's points
                                .then(function () {
                                    res.status(200)
                                        .json({
                                            status: 'success',
                                            message: 'Updated student points and coupons'
                                        });
                                })
                                .catch(function (err) {
                                    return next(err);
                                });
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                })
                .catch(function (err) {
                    return next(err);
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function updateStudentCouponsUse(req, res, next) {
    var scouponid = req.body.params.scouponid;
    db.none('update studentcoupons set owned = false where scouponid = $1', [scouponid]) //student does not own the coupon anymore
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Updated student points and coupons'
                });
        })
        .catch(function (err) {
            return next(err);
        });

}

/***************************/
/**********Delete***********/

/***************************/

function deleteCourse(req, res, next) {
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

function deleteUser(req, res, next) {
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

function deleteAssessment(req, res, next) {
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

function deleteTask(req, res, next) {
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

function removeStudentFromCourse(req, res, next) {
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

function removeLecturerCourse(req, res, next) {
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