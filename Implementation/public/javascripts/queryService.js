'use strict';
angular.module('queries', []).service('queryService', function($http){
    this.getUsers = function(){
        return $http.get('/api/getUsers')
            .then(function sucessCall(response)	{
                    return response.data.data;
                },function errorCall()	{
                    console.log("Error reading users list.");
                }
            );
    };

    this.getLecturers = function(){
        return $http.get('/api/getLecturers')
            .then(function sucessCall(response)	{
                    return response.data.data;
                },function errorCall()	{
                    console.log("Error reading lecturers list.");
                }
            );
    };

    this.getStudents = function(){
        return $http.get('/api/getStudents')
            .then(function sucessCall(response)	{
                    return response.data.data;
                },function errorCall()	{
                    console.log("Error reading students list.");
                }
            );
    };

    this.getCourses = function(){
        return $http.get('/api/getCourses')
            .then(function sucessCall(response)	{
                    return response.data.data;
                },function errorCall()	{
                    console.log("Error reading courses list.");
                }
            );
    };

    this.getAssessments = function(){
        return $http.get('/api/getAssessments')
            .then(function sucessCall(response)	{
                    return response.data.data;
                },function errorCall()	{
                    console.log("Error reading assessments list.");
                }
            );
    };

    this.getMaxUserId = function(){
        return $http.get('/api/getMaxUserId');
    };

    this.getStudentsInCourse = function(courseid){
        return $http.get('/api/getStudentsInCourse', {
            params: {
                id: courseid
            }
        }).then(function sucessCall(response)	{
                return response.data.data;
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
                return response.data.data;
            },function errorCall()	{
                console.log("Error reading student not in course list.");
            }
        );
    };
});