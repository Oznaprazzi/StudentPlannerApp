'use strict';
angular.module('queries', []).service('queryService', function($http){
    var users = [];
    var lecturers = [];
    var students = [];
    var courses = [];
    var assessments = [];
    var studentsInCourse = [];
    var studentsNotInCourse = [];

    this.getUsers = function(){
        $http.get('/api/getUsers')
            .then(function sucessCall(response)	{
                    users = response.data.data;
                    console.log(users);
                },function errorCall()	{
                    console.log("Error reading users list.");
                }
            );
    };

    this.getLecturers = function(){
        $http.get('/api/getLecturers')
            .then(function sucessCall(response)	{
                    lecturers =  response.data.data;
                },function errorCall()	{
                    console.log("Error reading lecturers list.");
                }
            );
    };

    this.getStudents = function(){
        $http.get('/api/getStudents')
            .then(function sucessCall(response)	{
                    students = response.data.data;
                },function errorCall()	{
                    console.log("Error reading students list.");
                }
            );
    };

    this.getCourses = function(){
        $http.get('/api/getCourses')
            .then(function sucessCall(response)	{
                    courses = response.data.data;
                },function errorCall()	{
                    console.log("Error reading courses list.");
                }
            );
    };

    this.getAssessments = function(){
        $http.get('/api/getAssessments')
            .then(function sucessCall(response)	{
                    assessments = response.data.data;
                },function errorCall()	{
                    console.log("Error reading assessments list.");
                }
            );
    };

    this.getMaxUserId = function(){
        return $http.get('/api/getMaxUserId');
    };

    this.getStudentsInCourse = function(courseid){
        $http.get('/api/getStudentsInCourse', {
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
        $http.get('/api/getStudentsNotInCourse', {
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

    /*******GETTERS********/
    this.users = function(){
        console.log(users);
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
});