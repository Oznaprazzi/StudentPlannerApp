const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/studentplannerdb';
var db = require('../queries');
//http://mherman.org/blog/2016/03/13/designing-a-restful-api-with-node-and-postgres/

router.get('/api/getMaxUserId', db.getMaxUserId);
router.get('/api/getMaxLecturerId', db.getMaxLecturerId);

router.get('/api/getUsers', db.getUsers);
router.get('/api/getStudents', db.getStudents);
router.get('/api/getLecturers', db.getLecturers);
router.get('/api/getCourses', db.getCourses);
router.get('/api/getAssessments', db.getAssessments);

router.get('/api/getStudentsInCourse', db.getStudentsInCourse);
router.get('/api/getStudentsNotInCourse', db.getStudentsNotInCourse);
router.get('/api/getStudentsCourses', db.getStudentsCourses);
router.get('/api/getLecturersCourses', db.getLecturersCourses);

router.post('/api/createNewUser', db.createNewUser);
router.post('/api/createNewStudent', db.createNewStudent);
router.post('/api/createNewLecturer', db.createNewLecturer);
router.post('/api/createNewCourse', db.createNewCourse);

router.post('/api/addStudentToCourse', db.addStudentToCourse);
router.post('/api/addLecturerCourses', db.addLecturerCourses);

router.post('/api/updateCourse', db.updateCourse);
router.post('/api/updateUser', db.updateUser);
router.post('/api/updateStudent', db.updateStudent);
router.post('/api/updateLecturer', db.updateLecturer);

router.post('/api/deleteCourse', db.deleteCourse);
router.post('/api/deleteUser', db.deleteUser);

router.post('/api/removeStudentFromCourse', db.removeStudentFromCourse);
router.post('/api/removeLecturerCourse', db.removeLecturerCourse);


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Student Planner'});
});

module.exports = router;
