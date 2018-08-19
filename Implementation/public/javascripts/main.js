var app = angular.module('studentPlanner', ['mwl.calendar', 'ngAnimate', 'ui.bootstrap', 'colorpicker.module', 'ngRoute', 'ngMaterial', 'queries', 'dialogs', 'isteven-multi-select']);

app.controller('mainBodyController', function ($scope, $http, $mdDialog, $route, queryService, dialogService, $rootScope) {
    //Calendar Implementation
    $scope.view = 1;
    $scope.loginFailMessage = '';
    $scope.userType = '';
    $scope.coursecode = '';
    $scope.currentCourse = '';
    $scope.formData = {};
    $scope.studentsList = [];
    $scope.qs = queryService;

    $scope.assessmentType = ['Assignment', 'Test', 'Exam', 'Other'];

    var viewStack = [];


    async function loadAllQueries(){
        await $scope.qs.getUsers();
        await $scope.qs.getStudents();
        await $scope.qs.getLecturers();
        await $scope.qs.getCourses();
        if (JSON.parse(sessionStorage.getItem('loggedIn'))) {
            $scope.user = JSON.parse(sessionStorage.getItem('user'));
            $scope.userType = sessionStorage.getItem('userType');
            if($scope.userType == 'lecturer'){
                await $scope.qs.getLecturersCourses($scope.user.lecturerid);
                $scope.courses = $scope.qs.lecturersCourses();
                $scope.setView(3);
            }else{
                $scope.courses = $scope.qs.courses();
                $scope.setView(2);
            }
        }
    }

    async function loadLecturerCourses(lecturerId){
        await $scope.qs.getLecturersCourses(lecturerId);
    }

    loadAllQueries();

    $scope.setView = function (view) {
        $scope.view = view;
        $rootScope.view = view;
        viewStack.push(view);
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
                $rootScope.userType = $scope.userType;
                sessionStorage.setItem('userType', $scope.userType);
                sessionStorage.setItem('loggedIn', true);
                sessionStorage.setItem('userIndex', userIndex);
                if($scope.userType == 'lecturer'){
                    loadLecturerCourses($scope.user.lecturerid);
                    $scope.courses = $scope.qs.lecturersCourses();
                    $scope.setView(3);
                }else{
                    $scope.courses = $scope.qs.courses();
                    $scope.setView(2);
                }
                $scope.cancelLogin();

            } else {
                $scope.loginFailMessage = "Incorrect Username Or Password. Please Try Again.";
            }
        }
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
        $scope.setView(1);
        $scope.cancelLogin();
        sessionStorage.clear();
        $scope.user = {};
        $scope.userType = '';
    };

    $scope.goHome = function () {
        if($scope.userType == 'lecturer'){
            $scope.setView(3);
            return;
        }
        $scope.setView(2);
    };

    $scope.goBack = function () {
        viewStack.splice(-1, 1);
        $scope.view = viewStack[viewStack.length - 1];
        sessionStorage.setItem('viewStack', viewStack);
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
        console.log($scope.qs.assessments());
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
        if (viewStack[viewStack.length - 2] == 5) {
            $scope.setView(5);
        } else {
            $scope.setView(7);
        }
    };

    async function assessmentInformation(assessmentid){
        await $scope.qs.getTasks(assessmentid);
    }

    $scope.setAssessment = function (assessment) {
        assessmentInformation(assessment.assessmentid);
        $scope.currentAssessment = assessment;
        $rootScope.currentAssessment = assessment;
        $scope.minDate = assessment.startdate;
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
        angular.forEach($scope.formData.coursesList, function (course) {
            if (course.courseid == courseid) {
                return false;
            }
        });
        return true;
    }

    function isNewCourse(courseid, list) {
        angular.forEach(list, function (scourse) {
            if (scourse.courseid == courseid) {
                return false;
            }
        });
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
    };

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
        $rootScope.task = task;
        var prompt = dialogService.editTaskPrompt(DialogController);
        $mdDialog.show(prompt);
    };

    $scope.deleteTask = function (ev, task) {
        var confirm = dialogService.confirm('Are you sure you want to delete this task?', 'Delete Task', 'Yes',
            'No', ev);

        $mdDialog.show(confirm).then(function () {
            var request = $http.post('/api/deleteTask', {
                params: {
                    taskid: $scope.task.taskid
                }
            });

            request.then(function success(data) {
                $scope.qs.getTasks($scope.currentAssessment.assessmentid);
                var alert = dialogService.alert('Task has been successfully deleted!',
                    'Task Successfully Deleted', ev);
                $mdDialog.show(alert);
            });
        }, function () {
            //Stay on current page
        });
    };

    $scope.openMenu = function($mdMenu, ev) {
        $mdMenu.open(ev);
    };

    function DialogController($scope, $mdDialog, $rootScope, queryService, dialogService) {
        $scope.qs = queryService;
        $scope.task = $rootScope.task;
        $scope.points = 2;
        $scope.closeDialog = function() {
            $mdDialog.hide();
        };

        $scope.saveTask = function(ev){
            if($scope.description == '' || $scope.description == undefined){
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
                $scope.qs.getTasks($rootScope.currentAssessment.assessmentid);
                var alert = dialogService.alert('Task successfully added',
                    'Task saved', ev);
                $mdDialog.show(alert);
            });

        };

        $scope.updateTask = function(ev){
            if($scope.task.description == '' || $scope.task.description == undefined){
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
                $scope.qs.getTasks($rootScope.currentAssessment.assessmentid);
                var alert = dialogService.alert('Task successfully updated',
                    'Task updated', ev);
                $mdDialog.show(alert);
            });

        }
    }
});

app.config(function($mdDateLocaleProvider){
    $mdDateLocaleProvider.formatDate = function(date) {
        return moment(date).format("DD/MM/YYYY");
    };
});