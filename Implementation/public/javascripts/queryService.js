'use strict';
angular.module('queries', []).service('queryService', function($http, $async){
    var users = [];
    var lecturers = [];
    var students = [];
    var courses = [];
    var assessments = [];
    var studentsInCourse = [];
    var studentsNotInCourse = [];
    var studentsCourses = [];
    var lecturersCourses = [];

    /***************************/
    /*********Get IDs**********/
    /***************************/

    this.getMaxUserId = function(){
        return $http.get('/api/getMaxUserId');
    };

    this.getMaxLecturerId = function(){
        return $http.get('/api/getMaxLecturerId');
    };

    /***************************/
    /*****Get Original Lists****/
    /***************************/

    this.getStuff = $async(function*() {
        var someStuff = yield getUsersRequest();
        var someOtherStuff = yield getLecturersRequest();
        console.log("we're done");
    });

    function getUsersRequest(){
        $http.get('/api/getUsers')
            .then(function sucessCall(response)	{
                    users = response.data.data;
                },function errorCall()	{
                    console.log("Error reading users list.");
                }
            );
    };

    function getLecturersRequest(){
        $http.get('/api/getLecturers')
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

    this.getAssessments = function(){
        return $http.get('/api/getAssessments')
            .then(function sucessCall(response)	{
                    assessments = response.data.data;
                },function errorCall()	{
                    console.log("Error reading assessments list.");
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
});