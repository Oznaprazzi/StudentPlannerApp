'use strict';
angular.module('functions', ['queries']).service('jsFunctionService', function(queryService){
    var qs = queryService;

    this.getUserType = function(i){
        if(isLecturer(i)){
            return 'lecturer';
        }else if(isStudent(i)){
            return 'student';
        }
        return 'admin';
    }

    function isLecturer(i){
        for(let j = 0; j < this.qs.lecturers().length; j++){
            if (this.qs.lecturers()[j].userid === this.qs.users()[i].userid) {
                return true;
            }
        }
        return false;
    }

    function isStudent(i){
        for(let j = 0; j < this.qs.students().length; j++){
            if (this.qs.students()[j].userid === this.qs.users()[i].userid) {
                return true;
            }
        }
        return false;
    }
});