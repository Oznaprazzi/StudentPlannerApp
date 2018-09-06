var app = angular.module('studentPlanner', ['mwl.calendar', 'ngAnimate', 'ui.bootstrap', 'colorpicker.module', 'ngRoute', 'ngMaterial', 'queries', 'dialogs', 'isteven-multi-select']);

app.controller('mainBodyController', function ($scope, $http, $mdDialog, $route, queryService, dialogService, $rootScope) {
    //Calendar Implementation
    $rootScope.view = 1;
    $scope.done = false;
    $scope.loginFailMessage = '';
    $rootScope.userType = '';
    $rootScope.coursecode = '';
    $rootScope.currentCourse = '';
    $scope.formData = {};
    $scope.studentsList = [];
    $rootScope.qs = queryService;

    $scope.assessmentType = ['Assignment', 'Test', 'Exam', 'Other'];

    var viewStack = [];


    async function loadAllQueries(){
        await $rootScope.qs.getUsers();
        await $rootScope.qs.getStudents();
        await $rootScope.qs.getLecturers();
        await $rootScope.qs.getCourses();
        if (JSON.parse(sessionStorage.getItem('loggedIn'))) {
            $rootScope.user = JSON.parse(sessionStorage.getItem('user'));
            $rootScope.userType = sessionStorage.getItem('userType');
            if($rootScope.userType == 'lecturer'){
                await $rootScope.qs.getLecturersCourses($rootScope.user.lecturerid);
                $scope.courses = $rootScope.qs.lecturersCourses();
                $rootScope.setView(3);
            }else if($rootScope.userType == 'student'){
                await $rootScope.qs.getStudentsCourses($rootScope.user.studentid);
                $scope.courses = $rootScope.qs.studentsCourses();
                $rootScope.setView(2);
            }else{
                $scope.courses = $rootScope.qs.courses();
                $rootScope.setView(2);
            }
        }
    }

    async function loadLecturerCourses(lecturerId){
        await $rootScope.qs.getLecturersCourses(lecturerId);
    }

    async function loadStudent(studentid){
        await $rootScope.qs.getStudentsCourses(studentid);
    }

    loadAllQueries();

    $rootScope.setView = function (view) {
        $rootScope.view = view;
        viewStack.push(view);
        console.log(viewStack);
        $scope.errorMessage = '';
    };

    $scope.isView = function (type, view) {
        return $rootScope.userType == type && $rootScope.view == view;
    };

    $scope.isSharedView = function (view) {
        return $rootScope.view == view;
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
        for(let j = 0; j < $rootScope.qs.lecturers().length; j++){
            if ($rootScope.qs.lecturers()[j].userid === $rootScope.qs.users()[i].userid) {
                sessionStorage.setItem('user', JSON.stringify($rootScope.qs.lecturers()[j]));
                $rootScope.user = $rootScope.qs.lecturers()[j];
                return true;
            }
        }
        return false;
    }

    function isStudent(i){
        for(let j = 0; j < $rootScope.qs.students().length; j++){
            if ($rootScope.qs.students()[j].userid === $rootScope.qs.users()[i].userid) {
                sessionStorage.setItem('user', JSON.stringify($rootScope.qs.students()[j]));
                $rootScope.user = $rootScope.qs.students()[j];
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

            for (let i = 0; i < $rootScope.qs.users().length; i++) {
                if ($rootScope.qs.users()[i].username == $scope.username) {
                    $scope.validUsername = true;
                    $scope.currentUser = $rootScope.qs.users()[i];
                    userIndex = i;
                    break;
                }
            }
            if (userIndex >= 0 && $rootScope.qs.users()[userIndex].password == $scope.password) {
                $scope.validPassword = true;
            }
            if ($scope.validUsername && $scope.validPassword) {
                sessionStorage.setItem('user', JSON.stringify($rootScope.qs.users()[userIndex]));
                $rootScope.userType = getUserType(userIndex);
                $rootScope.userType = $rootScope.userType;
                sessionStorage.setItem('userType', $rootScope.userType);
                sessionStorage.setItem('loggedIn', true);
                sessionStorage.setItem('userIndex', userIndex);
                if($rootScope.userType == 'lecturer'){
                    loadLecturerCourses($rootScope.user.lecturerid);
                    $scope.courses = $rootScope.qs.lecturersCourses();
                    $rootScope.setView(3);
                }else if($rootScope.userType == 'student'){
                    loadStudent($rootScope.user.studentid);
                    $scope.courses = $scope.qs.studentsCourses();
                    $rootScope.setView(2);
                }else {
                    $scope.courses = $rootScope.qs.courses();
                    $rootScope.setView(2);
                }
                $scope.cancelLogin();

            } else {
                $scope.loginFailMessage = "Incorrect Username Or Password. Please Try Again.";
            }
        }
    };

    $scope.reloadStudent = function(){
        $rootScope.qs.getStudents().then(function(){
            $rootScope.user = $rootScope.qs.students()[sessionStorage.getItem('studentIndex')];
        });
    };

    $scope.$watch('view', function () {
        resetCourse();
    });

    function resetCourse() {
        angular.forEach($rootScope.qs.courses(), function (course) {
            course.ticked = false;
        });
        $rootScope.currentCourse.ticked = true;
    }

    //Logout
    $scope.logout = function () {
        $rootScope.userType = '';
        $rootScope.setView(1);
        $scope.cancelLogin();
        sessionStorage.clear();
        $rootScope.user = {};
        $rootScope.userType = '';
    };

    $scope.goHome = function () {
        if($rootScope.userType == 'lecturer'){
            $rootScope.setView(3);
            return;
        }
        $rootScope.setView(2);
    };

    $scope.goBack = function () {
        viewStack.splice(-1, 1);
        console.log(viewStack);
        $rootScope.view = viewStack[viewStack.length - 1];
        sessionStorage.setItem('viewStack', viewStack);
    };

    $scope.cancelLogin = function () {
        $scope.loginFailMessage = "";
        $scope.username = "";
        $scope.password = "";
    };

    async function loadCourseInformation(courseid){
        await $rootScope.qs.getAssessments(courseid);
        await $rootScope.qs.getStudentsInCourse(courseid);
        await $rootScope.qs.getStudentsNotInCourse(courseid);
        $scope.studentsList = $rootScope.qs.studentsNotInCourse();
        console.log($rootScope.qs.assessments());
    }


    $scope.setCourse = function (course) {
        $scope.courseList = [];
        $rootScope.currentCourse = course;
        $rootScope.coursecode = course.coursecode;
        $rootScope.currentCourse.ticked = true;
        loadCourseInformation(course.courseid);
    };

    $scope.setLecturer = function (lecturer) {
        $scope.selectedUser = lecturer;
        $rootScope.qs.getLecturersCourses(lecturer.lecturerid).then(function () {
            angular.forEach($rootScope.qs.courses(), function (course) {
                angular.forEach($rootScope.qs.lecturersCourses(), function (lCourse) {
                    if (course.courseid == lCourse.courseid) {
                        course.ticked = true;
                    }
                });
            });
        });
    };

    $scope.setLecturerId = function () {
        $scope.maxid = 0;
        $rootScope.qs.getMaxUserId()
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
        $rootScope.qs.getStudentsCourses(student.studentid).then(function () {
            angular.forEach($rootScope.qs.courses(), function (course) {
                angular.forEach($rootScope.qs.studentsCourses(), function (studentCourse) {
                    if (course.courseid == studentCourse.courseid) {
                        course.ticked = true;
                    }
                });
            });
        });
    };

    $scope.setCancelEditStudentView = function () {
        if (viewStack[viewStack.length - 2] == 5) {
            $rootScope.setView(5);
        } else {
            $rootScope.setView(7);
        }
    };

    async function assessmentInformation(assessmentid){
        await $rootScope.qs.getTasks(assessmentid);
        $scope.tasks = $rootScope.qs.tasks();
        if($rootScope.userType == 'student'){
            await $rootScope.qs.getStudentTasks($rootScope.user.studentid, assessmentid);
            $scope.tasks = $rootScope.qs.studentTasks();
        }
    }

    $scope.setAssessment = function (assessment) {
        assessmentInformation(assessment.assessmentid);
        $scope.tasks = $rootScope.qs.studentTasks();
        $scope.currentAssessment = assessment;
        $rootScope.currentAssessment = assessment;
        $scope.minDate = assessment.startdate;
    };

    async function loadCourses(){
        await $rootScope.qs.getCourses();
    }

    $scope.addCourse = function (ev) {
        if ($rootScope.coursecode == '') {
            $scope.errorMessage = 'Course Code Cannot Be Empty!';
            return;
        }
        var request = $http.post('/api/createNewCourse', {
            params: {
                coursecode: $rootScope.coursecode
            }
        });

        request.then(function success(data) {
            loadCourses();
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = dialogService.confirm($rootScope.coursecode + ' has been successfully added!',
                'Added Course', 'Add Another Course', 'Back', ev);

            $rootScope.coursecode = '';
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
            $scope.addStudentToCourse(student.studentid, $rootScope.currentCourse.courseid);
        });

        var alert = dialogService.alert('Student(s) have been successfully added to ' + $rootScope.currentCourse.coursecode + '!',
            'Student(s) Successfully Added', ev);

        $scope.errorMessage = '';

        $mdDialog.show(alert).then(function () {
            $rootScope.qs.getStudentsInCourse($rootScope.currentCourse.courseid);
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
            $rootScope.qs.getMaxUserId().then(function (response) {
                    var maxid = response.data.data.max;
                    $http.post('/api/createNewStudent', {
                        params: {
                            userid: maxid,
                            studentid: $scope.studentid
                        }
                    }).then(function success() {
                        $rootScope.qs.getUsers();
                        $rootScope.qs.getStudents();
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
                            $rootScope.qs.getStudentsInCourse($rootScope.currentCourse.courseid);
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
        if ($rootScope.currentCourse.coursecode == '') {
            $scope.errorMessage = 'Course Code Cannot Be Empty!';
            return;
        }

        var request = $http.post('/api/updateCourse', {
            params: {
                coursecode: $rootScope.currentCourse.coursecode,
                id: $rootScope.currentCourse.courseid
            }
        });

        request.then(function success(data) {
            $rootScope.qs.getCourses();
            $route.reload();
            // Appending dialog to document.body to cover sidenav in docs app
            var alert = dialogService.alert($rootScope.currentCourse.coursecode + ' has been successfully updated!',
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
                    id: $rootScope.currentCourse.courseid
                }
            });
            request.then(function success(data) {
                $route.reload();
                // Appending dialog to document.body to cover sidenav in docs app
                var alert = dialogService.alert($rootScope.coursecode + ' has been successfully deleted!',
                    'Course Successfully Deleted', ev);

                $mdDialog.show(alert).then(function () {
                    $rootScope.qs.getCourses();
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
            $rootScope.qs.getUsers();
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
                        if (isNewCourse(course.courseid, $rootScope.qs.studentsCourses())) {
                            $scope.addStudentToCourse($scope.selectedUser.studentid, course.courseid);
                        }
                    });

                    angular.forEach($rootScope.qs.studentsCourses(), function (course) {
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
                        $rootScope.qs.getStudents();
                        $rootScope.qs.getStudentsInCourse($rootScope.currentCourse.courseid);
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
                        if (isNewCourse(course.courseid, $rootScope.qs.lecturersCourses())) {
                            addLecturerCourses($scope.selectedUser.lecturerid, course.courseid);
                        }
                    });

                    angular.forEach($rootScope.qs.lecturersCourses(), function (course) {
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
                        $rootScope.qs.getLecturers();
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
                $rootScope.qs.getUsers();
                $rootScope.qs.getCourses();
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
                        $rootScope.qs.getStudents();
                        $rootScope.qs.getStudentsInCourse($rootScope.currentCourse.courseid);
                        $scope.setCancelEditStudentView();
                    } else if (userType == 'lecturer') {//Lecturer
                        $rootScope.qs.getLecturers();
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
                    courseid: $rootScope.currentCourse.courseid
                }
            }).then(function () {
                $rootScope.qs.getStudentsInCourse($rootScope.currentCourse.courseid);
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
            $rootScope.qs.getMaxUserId().then(function (response) {
                var maxid = response.data.data.max;
                $http.post('/api/createNewLecturer', {
                    params: {
                        userid: maxid
                    }
                }).then(function success() {
                    $rootScope.qs.getUsers();
                    $rootScope.qs.getLecturers();
                    $rootScope.qs.getMaxLecturerId().then(function (response) {
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
                            $rootScope.qs.getStudentsInCourse($rootScope.currentCourse.courseid);
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
            $rootScope.qs.getAssessments($scope.courseid);
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
            $rootScope.qs.getAssessments($scope.currentAssessment.courseid);
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
                $rootScope.qs.getAssessments($scope.currentAssessment.courseid);
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
        if($rootScope.view > 2 && $rootScope.userType != 'lecturer'){
            return true;
        }else if($rootScope.view > 3 && $rootScope.userType == 'lecturer'){
            return true;
        }
        return false;
    }

    $scope.setNewAssessment = function(){
        $scope.dueDate = new Date();
        $scope.courseid = $rootScope.currentCourse.courseid;
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
                    taskid: task.taskid
                }
            });

            request.then(function success(data) {
                $rootScope.qs.getTasks($scope.currentAssessment.assessmentid);
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

    function DialogController($scope, $mdDialog, $rootScope, dialogService) {
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
                $rootScope.qs.getMaxTaskId().then(function (response) {
                    var maxid = response.data.data.max;
                    for(let i = 0; i < $rootScope.qs.studentsInCourse().length; i++){
                        addTaskToStudent($rootScope.qs.studentsInCourse()[i].studentid, maxid);
                    }

                    $rootScope.qs.getTasks($rootScope.currentAssessment.assessmentid);
                    var alert = dialogService.alert('Task successfully added',
                        'Task saved', ev);
                    $mdDialog.show(alert);
                });
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
                $rootScope.qs.getTasks($rootScope.currentAssessment.assessmentid);
                var alert = dialogService.alert('Task successfully updated',
                    'Task updated', ev);
                $mdDialog.show(alert);
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
            $rootScope.qs.updateTaskCompleted(task.taskid, task.completed, $rootScope.user.studentid).then(function(){
                $scope.reloadStudent();
                $rootScope.qs.updateStudentPoints($rootScope.user.points - task.points, $rootScope.user.studentid).then(function(){

                });
            });
        }else if(task.completed == false){
            task.completed = true;
            $rootScope.qs.updateTaskCompleted(task.taskid, task.completed, $rootScope.user.studentid).then(function(){
                $scope.reloadStudent();
                $rootScope.qs.updateStudentPoints($rootScope.user.points + task.points, $rootScope.user.studentid).then(function(){

                });
            });
        }
    }
});

app.config(function($mdDateLocaleProvider){
    $mdDateLocaleProvider.formatDate = function(date) {
        return moment(date).format("DD/MM/YYYY");
    };
});