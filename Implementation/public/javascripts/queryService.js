'use strict';
angular.module('queries', []).service('queryService', function($http){
    var users = [];
    var lecturers = [];
    var students = [];
    var courses = [];
    var assessments = [];
    var studentsInCourse = [];
    var studentsNotInCourse = [];
    var studentsCourses = [];
    var lecturersCourses = [];
    var studentTasks = [];
    var tasks = [];

    /***************************/
    /*********Get IDs**********/
    /***************************/

    this.getMaxUserId = function(){
        return $http.get('/api/getMaxUserId');
    };

    this.getMaxLecturerId = function(){
        return $http.get('/api/getMaxLecturerId');
    };

    this.getMaxTaskId = function(){
        return $http.get('/api/getMaxTaskId');
    };

    this.getMaxAssessmentId = function(){
        return $http.get('/api/getMaxAssessmentId');
    };

    /***************************/
    /*****Get Original Lists****/
    /***************************/

    this.getUsers = function(){
        return $http.get('/api/getUsers')
            .then(function sucessCall(response)	{
                    users = response.data.data;
                },function errorCall()	{
                    console.log("Error reading users list.");
                }
            );
    };

    this.getLecturers = function(){
        return $http.get('/api/getLecturers')
            .then(function sucessCall(response)	{
                console.log(response);
                    lecturers =  response.data.data;
                },function errorCall()	{
                    console.log("Error reading lecturers list.");
                }
            );
    };

    this.getStudents = function(){
        return $http.get('/api/getStudents')
            .then(function sucessCall(response)	{
                    students = response.data.data;
                },function errorCall()	{
                    console.log("Error reading students list.");
                }
            );
    };

    this.getCourses = function(){
        return $http.get('/api/getCourses')
            .then(function sucessCall(response)	{
                    courses = response.data.data;
                },function errorCall()	{
                    console.log("Error reading courses list.");
                }
            );
    };

    this.getAssessments = function(courseid){
        return $http.get('/api/getAssessments', {
            params:{
                courseid: courseid
            }
        })
            .then(function sucessCall(response)	{
                    assessments = response.data.data;
                },function errorCall()	{
                    console.log("Error reading assessments list.");
                }
            );
    };

    this.getTasks = function(assessmentid){
        return $http.get('/api/getTasks', {
            params:{
                assessmentid: assessmentid
            }
        })
            .then(function sucessCall(response)	{
                    tasks = response.data.data;
                },function errorCall()	{
                    console.log("Error reading tasks list.");
                }
            );
    };

    /***************************/
    /******Get Join Lists*******/
    /***************************/

    this.getStudentsInCourse = function(courseid){
        return $http.get('/api/getStudentsInCourse', {
            params: {
                id: courseid
            }
        }).then(function sucessCall(response)	{
                studentsInCourse = response.data.data;
            },function errorCall()	{
                console.log("Error reading student in course list.");
            }
        );
    };

    this.getStudentsNotInCourse = function(courseid){
        return $http.get('/api/getStudentsNotInCourse', {
            params: {
                id: courseid
            }
        }).then(function sucessCall(response)	{
                studentsNotInCourse = response.data.data;
            },function errorCall()	{
                console.log("Error reading student not in course list.");
            }
        );
    };

    this.getStudentsCourses = function(studentid){
        return $http.get('/api/getStudentsCourses', {
            params: {
                studentid: studentid
            }
        }).then(function sucessCall(response)	{
            studentsCourses = response.data.data;
            },function errorCall()	{
                console.log("Error reading student\'s course list.");
            }
        );
    };

    this.getLecturersCourses = function(lecturerid){
        return $http.get('/api/getLecturersCourses', {
            params: {
                lecturerid: lecturerid
            }
        }).then(function sucessCall(response)	{
                lecturersCourses = response.data.data;
            },function errorCall()	{
                console.log("Error reading student\'s course list.");
            }
        );
    };

    this.getStudentTasks = function(studentid, assessmentid){
        return $http.get('/api/getStudentTasks', {
            params: {
                studentid: studentid,
                assessmentid: assessmentid
            }
        }).then(function sucessCall(response)	{
                studentTasks = response.data.data;
            },function errorCall()	{
                console.log("Error reading student\'s task list.");
            }
        );
    };

    /***************************/
    /*********Update***********/
    /***************************/
    this.updateTaskCompleted = function(taskid, completed, studentid){
        return $http.post('/api/updateTaskCompleted', {
            params: {
                taskid: taskid,
                completed: completed,
                studentid: studentid
            }
        });
    };

    this.updateStudentPoints = function(points, studentid){
        return $http.post('/api/updateStudentPoints', {
            params: {
                points: points,
                studentid: studentid
            }
        });
    };


    /***************************/
    /*********Getters***********/
    /***************************/

    this.users = function(){
        return users;
    };

    this.lecturers = function(){
        return lecturers;
    };

    this.students = function(){
        return students;
    };

    this.courses = function(){
        return courses;
    };

    this.assessments = function(){
      return assessments;
    };

    this.tasks = function(){
        return tasks;
    };

    this.studentsInCourse = function(){
        return studentsInCourse;
    };

    this.studentsNotInCourse = function(){
        return studentsNotInCourse;
    };

    this.studentsCourses = function(){
        return studentsCourses;
    };

    this.lecturersCourses = function(){
        return lecturersCourses;
    };

    this.studentTasks = function(){
        return studentTasks;
    };
});