var app = angular.module('studentPlanner', ['mwl.calendar', 'ngAnimate', 'ui.bootstrap', 'colorpicker.module', 'ngRoute', 'ngMaterial', 'queries', 'dialogs', 'isteven-multi-select', 'functions']);

app.controller('mainBodyController', function ($scope, $http, $mdDialog, $route, queryService, dialogService, $rootScope, jsFunctionService) {
    //Calendar Implementation
    $scope.view = 1;
    $scope.done = false;
    $scope.loginFailMessage = '';
    $scope.userType = '';
    $scope.coursecode = '';
    $scope.currentCourse = '';
    $scope.formData = {};
    $scope.studentsList = [];
    $scope.qs = queryService;
    $scope.fs = jsFunctionService;

    $scope.assessmentType = ['Assignment', 'Test', 'Exam', 'Other'];

    async function loadAllQueries(){
        await $scope.qs.getUsers();
        await $scope.qs.getStudents();
        await $scope.qs.getLecturers();
        await $scope.qs.getCourses();
        await $scope.qs.getCoupons();
        if (JSON.parse(sessionStorage.getItem('loggedIn'))) {
            $scope.user = JSON.parse(sessionStorage.getItem('user'));
            $scope.userType = sessionStorage.getItem('userType');
            $scope.fs.userType = $scope.userType;
            if($scope.userType == 'lecturer'){
                await $scope.qs.getLecturersCourses($scope.user.lecturerid);
                $scope.courses = $scope.qs.lecturersCourses();
                $rootScope.setView(3);
            }else if($scope.userType == 'student'){
                await $scope.qs.getStudentsCourses($scope.user.studentid);
                await $scope.qs.getStudentCoupons($scope.user.studentid);
                await $scope.qs.getStudentAssessments($scope.user.studentid);
                $scope.courses = $scope.qs.studentsCourses();
                $scope.user = $scope.qs.students()[sessionStorage.getItem('studentIndex')];
                sessionStorage.setItem('user', JSON.stringify($scope.user));
                $rootScope.setEvents($scope.qs.studentAssessments());
            }else{
                $scope.courses = $scope.qs.courses();
                $rootScope.setView(2);
            }
        }
    }

    async function loadLecturerCourses(){
        await $scope.qs.getLecturersCourses($scope.user.lecturerid);
        $scope.courses = $scope.qs.lecturersCourses();
    }

    async function loadStudent(){
        await $scope.qs.getStudentsCourses($scope.user.studentid);
        await $scope.qs.getStudentCoupons($scope.user.studentid);
        await $scope.qs.getStudentAssessments($scope.user.studentid);
        $scope.courses = $scope.qs.studentsCourses();
        $rootScope.setEvents($scope.qs.studentAssessments());
    }

    loadAllQueries();

    $rootScope.setView = function (view) {
        $scope.fs.setView(view);
        $scope.view = $scope.fs.view;
        $scope.errorMessage = '';
    };

    $scope.isView = function (type, view) {
        return $scope.userType == type && $scope.view == view;
    };

    $scope.isSharedView = function (view) {
        return $scope.view == view;
    };

    function getUserType(i) {
        if(isLecturer(i)){
            return 'lecturer';
        }else if(isStudent(i)){
            return 'student';
        }
        return 'admin';
    }

    function isLecturer(i){
        for(let j = 0; j < $scope.qs.lecturers().length; j++){
            if ($scope.qs.lecturers()[j].userid === $scope.qs.users()[i].userid) {
                sessionStorage.setItem('user', JSON.stringify($scope.qs.lecturers()[j]));
                $scope.user = $scope.qs.lecturers()[j];
                return true;
            }
        }
        return false;
    }

    function isStudent(i){
        for(let j = 0; j < $scope.qs.students().length; j++){
            if ($scope.qs.students()[j].userid === $scope.qs.users()[i].userid) {
                sessionStorage.setItem('user', JSON.stringify($scope.qs.students()[j]));
                $scope.user = $scope.qs.students()[j];
                sessionStorage.setItem('studentIndex', j);
                return true;
            }
        }
        return false;
    }

    $scope.login = function () {
        if ($scope.username == "" && $scope.password == "") {
            $scope.loginFailMessage = "Username And Password Cannot Be Empty";
        } else if ($scope.username == "" && $scope.password != "") {
            $scope.loginFailMessage = "Username Cannot Be Empty";
        } else if ($scope.password == "") {
            $scope.loginFailMessage = "Password Cannot Be Empty";
        } else {
            $scope.validUsername = false;
            $scope.validPassword = false;
            var userIndex = -1;

            for (let i = 0; i < $scope.qs.users().length; i++) {
                if ($scope.qs.users()[i].username == $scope.username) {
                    $scope.validUsername = true;
                    $scope.currentUser = $scope.qs.users()[i];
                    userIndex = i;
                    break;
                }
            }
            if (userIndex >= 0 && $scope.qs.users()[userIndex].password == $scope.password) {
                $scope.validPassword = true;
            }
            if ($scope.validUsername && $scope.validPassword) {
                sessionStorage.setItem('user', JSON.stringify($scope.qs.users()[userIndex]));
                $scope.userType = getUserType(userIndex);
                $scope.fs.userType = $scope.userType;
                sessionStorage.setItem('userType', $scope.userType);
                sessionStorage.setItem('loggedIn', true);
                sessionStorage.setItem('userIndex', userIndex);
                if($scope.userType == 'lecturer'){
                    loadLecturerCourses();
                    $rootScope.setView(3);
                }else if($scope.userType == 'student'){
                    loadStudent();
                    $rootScope.setView(2);
                }else {
                    $scope.courses = $scope.qs.courses();
                    $rootScope.setView(2);
                }
                $scope.cancelLogin();

            } else {
                $scope.loginFailMessage = "Incorrect Username Or Password. Please Try Again.";
            }
        }
    };

    $scope.reloadStudent = function(){
        $scope.qs.getStudents().then(function(){
            $scope.user = $scope.qs.students()[sessionStorage.getItem('studentIndex')];
            sessionStorage.setItem('user', JSON.stringify($scope.user));
        });
    };

    $scope.$watch('view', function () {
        resetCourse();
    });

    function resetCourse() {
        angular.forEach($scope.qs.courses(), function (course) {
            course.ticked = false;
        });
        $scope.currentCourse.ticked = true;
    }

    //Logout
    $scope.logout = function () {
        $scope.userType = '';
        $rootScope.setView(1);
        $scope.cancelLogin();
        sessionStorage.clear();
        $scope.user = {};
        $scope.fs.userType = $scope.userType;
        $scope.fs.viewStack = [];
    };

    $scope.goHome = function () {
        if($scope.userType == 'lecturer'){
            $rootScope.setView(3);
            return;
        }
        $rootScope.setView(2);
    };

    $scope.goBack = function () {
        $scope.fs.viewStack.splice(-1, 1);
        $scope.view = $scope.fs.viewStack[$scope.fs.viewStack.length - 1];
    };

    $scope.cancelLogin = function () {
        $scope.loginFailMessage = "";
        $scope.username = "";
        $scope.password = "";
    };

    async function loadCourseInformation(courseid){
        await $scope.qs.getAssessments(courseid);
        await $scope.qs.getStudentsInCourse(courseid);
        await $scope.qs.getStudentsNotInCourse(courseid);
        $scope.studentsList = $scope.qs.studentsNotInCourse();
    }


    $scope.setCourse = function (course) {
        $scope.courseList = [];
        $scope.currentCourse = course;
        $scope.coursecode = course.coursecode;
        $scope.currentCourse.ticked = true;
        loadCourseInformation(course.courseid);
    };

    $scope.setLecturer = function (lecturer) {
        $scope.selectedUser = lecturer;
        $scope.qs.getLecturersCourses(lecturer.lecturerid).then(function () {
            angular.forEach($scope.qs.courses(), function (course) {
                angular.forEach($scope.qs.lecturersCourses(), function (lCourse) {
                    if (course.courseid == lCourse.courseid) {
                        course.ticked = true;
                    }
                });
            });
        });
    };

    $scope.setLecturerId = function () {
        $scope.maxid = 0;
        $scope.qs.getMaxUserId()
            .then(function sucessCall(response) {
                    $scope.maxid = response.data.data.max;
                }, function errorCall() {
                    console.log("Error getting max user id.");
                }
            );
    };

    $scope.$watch('name', function () {
        $scope.lecturerid = $scope.name + $scope.maxid;
    });

    $scope.setStudent = function (student) {
        $scope.selectedUser = student;
        $scope.qs.getStudentsCourses(student.studentid).then(function () {
            angular.forEach($scope.qs.courses(), function (course) {
                angular.forEach($scope.qs.studentsCourses(), function (studentCourse) {
                    if (course.courseid == studentCourse.courseid) {
                        course.ticked = true;
                    }
                });
            });
        });
    };

    $scope.setCancelEditStudentView = function () {
        if ($scope.fs.viewStack[$scope.fs.viewStack.length - 2] == 5) {
            $rootScope.setView(5);
        } else {
            $rootScope.setView(7);
        }
    };

    async function assessmentInformation(assessmentid){
        if($scope.userType == 'student'){
            await $scope.qs.getStudentTasks($scope.user.studentid, assessmentid);
            $scope.tasks = $scope.qs.studentTasks();
        }else{
            await $scope.qs.getTasks(assessmentid);
            $scope.tasks = $scope.qs.tasks();
        }
    }

    $scope.setAssessment = function (assessment) {
        assessmentInformation(assessment.assessmentid, assessment);
        $scope.currentAssessment = assessment;
        $scope.minDate = assessment.startdate;
        $rootScope.setView(9);
    };

    async function loadCourses(){
        await $scope.qs.getCourses();
    }

    $scope.addCourse = function (ev) {
        if ($scope.coursecode == '') {
            $scope.errorMessage = 'Course Code Cannot Be Empty!';
            return;
        }
        var request = $http.post('/api/createNewCourse', {
            params: {
                coursecode: $scope.coursecode
            }
        });

        request.then(function success(data) {
            loadCourses();
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = dialogService.confirm($scope.coursecode + ' has been successfully added!',
                'Added Course', 'Add Another Course', 'Back', ev);

            $scope.coursecode = '';
            $scope.errorMessage = '';
            $mdDialog.show(confirm).then(function () {
                //Stay on current page
            }, function () {
                $scope.goBack();
            });
        });
    };

    $scope.addStudent = function (ev) {
        if ($scope.studentsList == []) {
            $scope.errorMessage = 'Please select at least one student to add to this course.';
            return;
        }
        console.log($scope.formData.studentsList);
        angular.forEach($scope.formData.studentsList, function (student) {
            console.log(student.studentid);
            $scope.addStudentToCourse(student.studentid, $scope.currentCourse.courseid);
        });

        var alert = dialogService.alert('Student(s) have been successfully added to ' + $scope.currentCourse.coursecode + '!',
            'Student(s) Successfully Added', ev);

        $scope.errorMessage = '';

        $mdDialog.show(alert).then(function () {
            $scope.qs.getStudentsInCourse($scope.currentCourse.courseid);
            $scope.goBack();
        });
    };

    $scope.addNewStudent = function (ev) {
        if ($scope.studentid == '' || $scope.name == '' || $scope.password == '') {
            $scope.errorMessage = 'Please fill in all fields.';
            return;
        }

        var request = $http.post('/api/createNewUser', {
            params: {
                username: $scope.studentid,
                name: $scope.name,
                password: $scope.password
            }
        });

        request.then(function success(data) {
            $scope.qs.getMaxUserId().then(function (response) {
                    var maxid = response.data.data.max;
                    $http.post('/api/createNewStudent', {
                        params: {
                            userid: maxid,
                            studentid: $scope.studentid
                        }
                    }).then(function success() {
                        $scope.qs.getUsers();
                        $scope.qs.getStudents();
                        angular.forEach($scope.formData.coursesList, function (course) {
                            $scope.addStudentToCourse($scope.studentid, course.courseid);
                        });

                        $route.reload();
                        // Appending dialog to document.body to cover sidenav in docs app
                        var confirm = dialogService.confirm($scope.name + ' has been successfully added!',
                            'Added Student', 'Add Another Student', 'Back', ev);

                        $scope.username = '';
                        $scope.studentid = '';
                        $scope.name = '';
                        $scope.password = '';
                        $scope.errorMessage = '';

                        $mdDialog.show(confirm).then(function () {
                            //Stay on current page
                        }, function () {
                            $scope.goBack();
                            resetCourse();
                            $scope.qs.getStudentsInCourse($scope.currentCourse.courseid);
                        });
                    });
                }, function errorCall() {
                    console.log("Error getting max user id.");
                }
            );
        });
    };

    $scope.addStudentToCourse = function (studentid, courseid) {
        return $http.post('/api/addStudentToCourse', {
            params: {
                studentid: studentid,
                courseid: courseid
            }
        });
    };

    $scope.updateCourse = function (ev) {
        if ($scope.currentCourse.coursecode == '') {
            $scope.errorMessage = 'Course Code Cannot Be Empty!';
            return;
        }

        var request = $http.post('/api/updateCourse', {
            params: {
                coursecode: $scope.currentCourse.coursecode,
                id: $scope.currentCourse.courseid
            }
        });

        request.then(function success(data) {
            $scope.qs.getCourses();
            $route.reload();
            // Appending dialog to document.body to cover sidenav in docs app
            var alert = dialogService.alert($scope.currentCourse.coursecode + ' has been successfully updated!',
                'Course Successfully Updated', ev);

            $scope.errorMessage = '';

            $mdDialog.show(alert).then(function () {
                $scope.goBack();
            });
        });
    };

    $scope.deleteCourse = function (ev) {

        var confirm = dialogService.confirm('Are you sure you want to delete this course?', 'Delete Course', 'Yes', 'No', ev);

        $mdDialog.show(confirm).then(function () {
            var request = $http.post('/api/deleteCourse', {
                params: {
                    id: $scope.currentCourse.courseid
                }
            });
            request.then(function success(data) {
                $route.reload();
                // Appending dialog to document.body to cover sidenav in docs app
                var alert = dialogService.alert($scope.coursecode + ' has been successfully deleted!',
                    'Course Successfully Deleted', ev);

                $mdDialog.show(alert).then(function () {
                    $scope.qs.getCourses();
                    $scope.goBack();
                    $scope.goBack();
                });
            });
        }, function () {
            //Stay on current page
        });
    };

    $scope.updateUser = function (ev, userType) {
        if ((userType != 'student' && $scope.selectedUser.username == '') || (userType == 'student' && $scope.selectedUser.studentid == '') || $scope.selectedUser.name == '' || $scope.selectedUser.password == '') {
            $scope.errorMessage = 'Please fill in all fields.';
            return;
        }

        if (userType == 'student') {
            $scope.selectedUser.username = $scope.selectedUser.studentid;
        }


        var request = $http.post('/api/updateUser', {
            params: {
                userid: $scope.selectedUser.userid,
                username: $scope.selectedUser.username,
                name: $scope.selectedUser.name,
                password: $scope.selectedUser.password
            }
        });

        request.then(function success(data) {
            $scope.qs.getUsers();
            $route.reload();
            var alert = dialogService.alert($scope.selectedUser.name + ' has been successfully updated!',
                'User Successfully Updated', ev);
            // Appending dialog to document.body to cover sidenav in docs app
            if (userType == 'student') {
                $http.post('/api/updateStudent', {
                    params: {
                        userid: $scope.selectedUser.userid,
                        studentid: $scope.selectedUser.studentid
                    }
                }).then(function success(data) {
                    angular.forEach($scope.formData.coursesList, function (course) {
                        if (isNewCourse(course.courseid, $scope.qs.studentsCourses())) {
                            $scope.addStudentToCourse($scope.selectedUser.studentid, course.courseid);
                        }
                    });

                    angular.forEach($scope.qs.studentsCourses(), function (course) {
                        if (isRemoveCourse(course.courseid)) {
                            $http.post('/api/removeStudentFromCourse', {
                                params: {
                                    studentid: $scope.selectedUser.studentid,
                                    courseid: course.courseid
                                }
                            });
                        }
                    });
                    $mdDialog.show(alert).then(function () {
                        $scope.setCancelEditStudentView();
                        $scope.qs.getStudents();
                        $scope.qs.getStudentsInCourse($scope.currentCourse.courseid);
                    });
                });
            } else if(userType == 'lecturer') {
                $http.post('/api/updateLecturer', {
                    params: {
                        userid: $scope.selectedUser.userid,
                        lecturerid: $scope.selectedUser.lecturerid
                    }
                }).then(function success(data) {
                    angular.forEach($scope.formData.coursesList, function (course) {
                        if (isNewCourse(course.courseid, $scope.qs.lecturersCourses())) {
                            addLecturerCourses($scope.selectedUser.lecturerid, course.courseid);
                        }
                    });

                    angular.forEach($scope.qs.lecturersCourses(), function (course) {
                        if (isRemoveCourse(course.courseid)) {
                            $http.post('/api/removeLecturerCourse', {
                                params: {
                                    studentid: $scope.selectedUser.lecturerid,
                                    courseid: course.courseid
                                }
                            });
                        }
                    });
                    $mdDialog.show(alert).then(function () {
                        $scope.goBack();
                        $scope.qs.getLecturers();
                    });
                });
            }else{
                $mdDialog.show(alert).then(function () {
                    $scope.goBack();
                });

            }

        });
    };

    function isRemoveCourse(courseid) {
        for(let i = 0; i < $scope.formData.coursesList.length; i++){
            if($scope.formData.coursesList[i].courseid == courseid){
                return false;
            }
        }
        return true;
    }

    function isNewCourse(courseid, list) {
        for(let i = 0; i < list.length; i++){
            if(list[i].courseid == courseid){
                return false;
            }
        }
        return true;
    }

    $scope.deleteUser = function (ev, userType) {
        var confirm = dialogService.confirm('Are you sure you want to delete this ' + userType + '?', 'Delete user', 'Yes',
            'No', ev);

        $mdDialog.show(confirm).then(function () {
            var request = $http.post('/api/deleteUser', {
                params: {
                    userid: $scope.selectedUser.userid
                }
            });
            request.then(function success(data) {
                $scope.qs.getUsers();
                $scope.qs.getCourses();
                $scope.username = '';
                $scope.studentid = '';
                $scope.name = '';
                $scope.password = '';
                $scope.errorMessage = '';
                // Appending dialog to document.body to cover sidenav in docs app
                var alert = dialogService.alert($scope.selectedUser.name + ' has been successfully deleted!',
                    'User Successfully Deleted', ev);
                $mdDialog.show(alert).then(function () {
                    if (userType == 'student') {//Student
                        $scope.qs.getStudents();
                        $scope.qs.getStudentsInCourse($scope.currentCourse.courseid);
                        $scope.setCancelEditStudentView();
                    } else if (userType == 'lecturer') {//Lecturer
                        $scope.qs.getLecturers();
                        $scope.goBack();
                    }
                });
                $route.reload();
            });
        }, function () {
            //Stay on current page
        });
    };

    $scope.removeStudentFromCourse = function(student, ev){
        var confirm = dialogService.confirm('Are you sure you want to remove this student from this course?', 'Remove student from course', 'Yes',
            'No', ev);

        $mdDialog.show(confirm).then(function () {
            $http.post('/api/removeStudentFromCourse', {
                params: {
                    studentid: student.studentid,
                    courseid: $scope.currentCourse.courseid
                }
            }).then(function () {
                $scope.qs.getStudentsInCourse($scope.currentCourse.courseid);
            });
        }, function(){

        });
    }

    $scope.addNewLecturer = function (ev) {
        if ($scope.name == '' || $scope.password == '') {
            $scope.errorMessage = 'Please fill in all fields.';
            return;
        }

        var request = $http.post('/api/createNewUser', {
            params: {
                username: $scope.lecturerid,
                name: $scope.name,
                password: $scope.password
            }
        });

        request.then(function success(data) {
            $scope.qs.getMaxUserId().then(function (response) {
                var maxid = response.data.data.max;
                $http.post('/api/createNewLecturer', {
                    params: {
                        userid: maxid
                    }
                }).then(function success() {
                    $scope.qs.getUsers();
                    $scope.qs.getLecturers();
                    $scope.qs.getMaxLecturerId().then(function (response) {
                        angular.forEach($scope.formData.coursesList, function (course) {
                            addLecturerCourses(response.data.data.max, course.courseid);
                        });
                        $route.reload();
                        // Appending dialog to document.body to cover sidenav in docs app
                        var confirm = dialogService.confirm($scope.name + ' has been successfully added!',
                            'Added Lecturer', 'Add Another Lecturer', 'Back', ev);

                        $scope.lecturerid = '';
                        $scope.name = '';
                        $scope.password = '';
                        $scope.errorMessage = '';

                        $mdDialog.show(confirm).then(function () {
                            $scope.setLecturerId();
                        }, function () {
                            $scope.goBack();
                            resetCourse();
                            $scope.qs.getStudentsInCourse($scope.currentCourse.courseid);
                        });
                    });
                });
            });
        });
    };

    function addLecturerCourses(lecturerid, courseid){
        return $http.post('/api/addLecturerCourses', {
            params: {
                lecturerid: lecturerid,
                courseid: courseid
            }
        });
    }

    $scope.addNewAssessment = function (ev) {
        if ($scope.title == undefined || $scope.type == undefined || $scope.details == undefined) {
            $scope.errorMessage = 'Please fill in all fields.';
            return;
        }

        var request = $http.post('/api/createNewAssessment', {
            params: {
                courseid: $scope.courseid,
                assessmenttype: $scope.type,
                startDate: new Date(),
                dueDate: $scope.dueDate,
                title: $scope.title,
                details: $scope.details
            }
        });

        request.then(function success(data) {
            $scope.qs.getAssessments($scope.courseid);
            $scope.qs.getMaxAssessmentId().then(function (response) {
                var maxid = response.data.data.max;
                for (let i = 0; i < $scope.qs.studentsInCourse().length; i++) {
                    addAssessmentToStudent($scope.qs.studentsInCourse()[i].studentid, maxid);
                }
                var confirm = dialogService.confirm($scope.title + ' has been successfully added!',
                    'Added Assessment', 'Add Another Assessment', 'Back', ev);

                $scope.course = '';
                $scope.type = '';
                $scope.dueDate = '';
                $scope.title = '';
                $scope.details = '';
                $scope.errorMessage = '';

                $mdDialog.show(confirm).then(function () {

                }, function () {
                    $scope.goBack();
                });
            });
        });
    };

    function addAssessmentToStudent(studentid, assessmentid){
        var request = $http.post('/api/addToCompleteAssessment', {
            params: {
                studentid: studentid,
                assessmentid: assessmentid
            }
        });
    }

    $scope.updateAssessment = function (ev) {
        if ($scope.currentAssessment.title == undefined || $scope.currentAssessment.assessmenttype == undefined || $scope.currentAssessment.details == undefined) {
            $scope.errorMessage = 'Please fill in all fields.';
            return;
        }

        var request = $http.post('/api/updateAssessment', {
            params: {
                courseid: $scope.currentAssessment.courseid,
                assessmenttype: $scope.currentAssessment.type,
                dueDate: $scope.currentAssessment.dueDate,
                title: $scope.currentAssessment.title,
                details: $scope.currentAssessment.details
            }
        });

        request.then(function success(data) {
            $scope.qs.getAssessments($scope.currentAssessment.courseid);
            var alert = dialogService.alert($scope.currentAssessment.title + ' has been successfully updated!',
                'Assessment Successfully Updated', ev);
            $mdDialog.show(alert).then(function () {
                $scope.goBack();
            });
        });
    };

    $scope.deleteAssessment = function (ev) {
        var confirm = dialogService.confirm('Are you sure you want to delete this assessment?', 'Delete Assessment', 'Yes',
            'No', ev);

        $mdDialog.show(confirm).then(function () {
            var request = $http.post('/api/deleteAssessment', {
                params: {
                    assessmentid: $scope.currentAssessment.assessmentid
                }
            });

            request.then(function success(data) {
                $scope.qs.getAssessments($scope.currentAssessment.courseid);
                var alert = dialogService.alert($scope.currentAssessment.title + ' has been successfully deleted!',
                    'Assessment Successfully Deleted', ev);
                $mdDialog.show(alert).then(function () {
                    $scope.goBack();
                    $scope.goBack();
                });
            });
        }, function () {
            //Stay on current page
        });
    };

    $scope.showHomeButton = function(){
        if($scope.view > 2 && $scope.userType != 'lecturer'){
            return true;
        }else if($scope.view > 3 && $scope.userType == 'lecturer'){
            return true;
        }
        return false;
    }

    $scope.setNewAssessment = function(){
        $scope.dueDate = new Date();
        $scope.courseid = $scope.currentCourse.courseid;
        $scope.type = "Assignment";
        $scope.minDate = new Date();
        console.log($scope.minDate);
    }

    $scope.addTask = function () {
        var prompt = dialogService.addTaskPrompt(DialogController);
        $mdDialog.show(prompt);
    };

    $scope.editTask = function (task) {
        $scope.task = task;
        var prompt = dialogService.editTaskPrompt(DialogController);
        $mdDialog.show(prompt);
    };

    $scope.deleteTask = function (ev, task) {
        var confirm = dialogService.confirm('Are you sure you want to delete this task?', 'Delete Task', 'Yes',
            'No', ev);

        $mdDialog.show(confirm).then(function () {
            var request = $http.post('/api/deleteTask', {
                params: {
                    taskid: task.taskid
                }
            });

            request.then(function success(data) {
                $scope.qs.getTasks($scope.currentAssessment.assessmentid).then(function() {
                    $scope.tasks = $scope.qs.tasks();
                    var alert = dialogService.alert('Task has been successfully deleted!',
                        'Task Successfully Deleted', ev);
                    $mdDialog.show(alert);
                });
            });
        }, function () {
            //Stay on current page
        });
    };

    $scope.openMenu = function($mdMenu, ev) {
        $mdMenu.open(ev);
    };

    function DialogController($scope, $mdDialog, $rootScope, dialogService) {
        $scope.task = $rootScope.task;
        $scope.points = 2;
        $scope.closeDialog = function() {
            $mdDialog.hide();
        };

        $scope.saveTask = function(ev){
            if(!$scope.description || !$scope.points){
                var alert = dialogService.alert('An error occured. New task was not added.',
                    'Task not saved', ev);
                $mdDialog.show(alert);
                return;
            }

            var request = $http.post('/api/createNewTask', {
                params: {
                    assessmentid: $rootScope.currentAssessment.assessmentid,
                    description: $scope.description,
                    points: $scope.points
                }
            });

            request.then(function success(data) {
                $rootScope.qs.getMaxTaskId().then(function (response) {
                    var maxid = response.data.data.max;
                    for(let i = 0; i < $rootScope.qs.studentsInCourse().length; i++){
                        addTaskToStudent($rootScope.qs.studentsInCourse()[i].studentid, maxid);
                    }

                    $rootScope.qs.getTasks($scope.currentAssessment.assessmentid).then(function(){
                        $scope.tasks = $rootScope.qs.tasks();
                        var alert = dialogService.alert('Task successfully added',
                            'Task saved', ev);
                        $mdDialog.show(alert);
                    });
                });
            });
        };

        $scope.updateTask = function(ev){
            if(!$scope.task.description || !$scope.task.points){
                var alert = dialogService.alert('An error occured. New task was not added.',
                    'Task not saved', ev);
                $mdDialog.show(alert);
                return;
            }

            var request = $http.post('/api/updateTask', {
                params: {
                    taskid: $scope.task.taskid,
                    description: $scope.task.description,
                    points: $scope.task.points
                }
            });

            request.then(function success(data) {
                $rootScope.qs.getTasks($scope.currentAssessment.assessmentid).then(function() {
                    $scope.tasks = $rootScope.qs.tasks();
                    var alert = dialogService.alert('Task successfully updated',
                        'Task updated', ev);
                    $mdDialog.show(alert);
                });
            });

        };

        function addTaskToStudent(studentid, taskid){
            var request = $http.post('/api/addToCompleteTask', {
                params: {
                    studentid: studentid,
                    taskid: taskid
                }
            });
        }
    }

    $scope.taskDone = function(task){
        if(task.completed == true){
            task.completed = false;
            updateStudentPoints(task);
        }else if(task.completed == false){
            task.completed = true;
            updateStudentPoints(task);
        }

    };

    function updateStudentPoints(task){
        $scope.qs.updateTaskCompleted(task.taskid, task.completed, $scope.user.studentid).then(function(){
            $scope.reloadStudent();
            $scope.qs.updateStudentPoints(task.points, task.completed, $scope.user.studentid).then(function(){
                $scope.reloadStudent();
            });
        });
    }

    $scope.addCoupon = function(ev){
        if(!$scope.amount || !$scope.points){
            $scope.errorMessage = 'Please input coupon amount.';
            return;
        }

        var request = $http.post('/api/createNewCoupon', {
            params: {
                amount: $scope.amount,
                points: $scope.points
            }
        });

        request.then(function success(data) {
            $scope.qs.getMaxCouponId().then(function (response) {
                var maxid = response.data.data.max;
                for(let i = 0; i < $scope.qs.students().length; i++){
                    addCouponToStudent($scope.qs.students()[i].studentid, maxid);
                }

                $scope.qs.getCoupons();

                var confirm = dialogService.confirm('Coupon successfully created!',
                    'Created Coupon', 'Create Another Coupon', 'Back', ev);

                $scope.amount = '';
                $scope.errorMessage = '';

                $mdDialog.show(confirm).then(function () {

                }, function () {
                    $scope.goBack();
                });
            });
        });
    }

    function addCouponToStudent(studentid, couponid){
        var request = $http.post('/api/addCouponToStudent', {
            params: {
                studentid: studentid,
                couponid: couponid
            }
        });
    }

    $scope.useCoupon = function(coupon, ev){
        var confirm = dialogService.confirm('This action cannot be undone', 'Use Coupon', 'Confirm',
            'Cancel', ev);

        $mdDialog.show(confirm).then(function () {
            var request = $http.post('/api/updateStudentCouponsUse', {
                params: {
                    scouponid: coupon.scouponid
                }
            });

            request.then(function success(data) {
                $scope.qs.getStudentCoupons($scope.user.studentid);
                $scope.reloadStudent();
            });
        }, function () {
            //Stay on current page
        });
    };

    $scope.getCoupon = function(coupon, ev){
        if(coupon.points > $scope.user.points){
            var alert = dialogService.alert('Error! You do not have enough points to redeem this coupon',
                'Not enough points', ev);
            $mdDialog.show(alert).then(function(){
                return;
            });
        }else{
            var confirm = dialogService.confirm('This coupon will be exchanged for ' + coupon.points + ' point(s) and cannot be undone', 'Get Coupon', 'Confirm',
                'Cancel', ev);

            $mdDialog.show(confirm).then(function () {
                var request = $http.post('/api/updateStudentCouponsGet', {
                    params: {
                        couponid: coupon.couponid,
                        studentid: coupon.studentid,
                        scouponid: coupon.scouponid
                    }
                });

                request.then(function success(data) {
                    $scope.reloadStudent();
                    console.log($scope.user);
                    $scope.qs.getStudentCoupons($scope.user.studentid).then(function() {
                        var alert = dialogService.alert('Coupon successfully redeemed!',
                            'Coupon Successfully Redeemed', ev);
                        $mdDialog.show(alert);
                    });
                });
            }, function () {
                //Stay on current page
            });
        }
    };
});

app.config(function($mdDateLocaleProvider){
    $mdDateLocaleProvider.formatDate = function(date) {
        return moment(date).format("DD/MM/YYYY");
    };
});