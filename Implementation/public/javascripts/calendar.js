var app = angular.module('mwl.calendar.docs', ['mwl.calendar', 'ngAnimate', 'ui.bootstrap', 'colorpicker.module', 'ngRoute', 'ngMaterial', 'multipleSelect', 'queries', 'dialogs']);
app.controller('calendarController', function(moment, alert, calendarConfig, $scope, $http, $mdDialog, $route, queryService, dialogService) {
        var vm = this;

        //These variables MUST be set as a minimum for the calendar to work
        vm.calendarView = 'month';
        vm.viewDate = new Date();
        var actions = [{
            label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
            onClick: function(args) {
                alert.show('Edited', args.calendarEvent);
            }
        }, {
            label: '<i class=\'glyphicon glyphicon-remove\'></i>',
            onClick: function(args) {
                alert.show('Deleted', args.calendarEvent);
            }
        }];
        vm.events = [
            {
                title: 'An event',
                color: calendarConfig.colorTypes.warning,
                startsAt: moment().startOf('week').subtract(2, 'days').add(8, 'hours').toDate(),
                endsAt: moment().startOf('week').add(1, 'week').add(9, 'hours').toDate(),
                draggable: true,
                resizable: true,
                actions: actions
            }, {
                title: '<i class="glyphicon glyphicon-asterisk"></i> <span class="text-primary">Another event</span>, with a <i>html</i> title',
                color: calendarConfig.colorTypes.info,
                startsAt: moment().subtract(1, 'day').toDate(),
                endsAt: moment().add(5, 'days').toDate(),
                draggable: true,
                resizable: true,
                actions: actions
            }, {
                title: 'This is a really long event title that occurs on every year',
                color: calendarConfig.colorTypes.important,
                startsAt: moment().startOf('day').add(7, 'hours').toDate(),
                endsAt: moment().startOf('day').add(19, 'hours').toDate(),
                recursOn: 'year',
                draggable: true,
                resizable: true,
                actions: actions
            }
        ];

        vm.cellIsOpen = true;

        vm.addEvent = function() {
            vm.events.push({
                title: 'New event',
                startsAt: moment().startOf('day').toDate(),
                endsAt: moment().endOf('day').toDate(),
                color: calendarConfig.colorTypes.important,
                draggable: true,
                resizable: true
            });
        };

        vm.eventClicked = function(event) {
            alert.show('Clicked', event);
        };

        vm.eventEdited = function(event) {
            alert.show('Edited', event);
        };

        vm.eventDeleted = function(event) {
            alert.show('Deleted', event);
        };

        vm.eventTimesChanged = function(event) {
            alert.show('Dropped or resized', event);
        };

        vm.toggle = function($event, field, event) {
            $event.preventDefault();
            $event.stopPropagation();
            event[field] = !event[field];
        };

        vm.timespanClicked = function(date, cell) {

            if (vm.calendarView === 'month') {
                if ((vm.cellIsOpen && moment(date).startOf('day').isSame(moment(vm.viewDate).startOf('day'))) || cell.events.length === 0 || !cell.inMonth) {
                    vm.cellIsOpen = false;
                } else {
                    vm.cellIsOpen = true;
                    vm.viewDate = date;
                }
            } else if (vm.calendarView === 'year') {
                if ((vm.cellIsOpen && moment(date).startOf('month').isSame(moment(vm.viewDate).startOf('month'))) || cell.events.length === 0) {
                    vm.cellIsOpen = false;
                } else {
                    vm.cellIsOpen = true;
                    vm.viewDate = date;
                }
            }

        };

        //Calendar Implementation
        $scope.view = 1;
        $scope.loginFailMessage = '';
        $scope.userType = '';
        $scope.courseCode = '';
        $scope.currentCourse = '';
        $scope.coursesList = [];
        $scope.studentsList = [];

        var viewStack = [];

        getUsers();
        getStudents();
        getLecturers();
        getAssessments();
        getCourses();
        function getUsers() {
            queryService.getUsers().then(function (data) {
                $scope.users = data;
            });
        }

        function getLecturers(){
            queryService.getLecturers().then(function(data) {
                $scope.lecturers = data;
            });
        }

        function getStudents(){
            queryService.getStudents().then(function(data) {
                $scope.students = data;
            });
        }

        function getAssessments(){
            queryService.getAssessments().then(function(data) {
                $scope.assessments = data;
            });
        }

        function getCourses(){
            queryService.getCourses().then(function(data) {
                $scope.courses = data;
            });
        }

        function getStudentsInCourse(courseid){
            queryService.getStudentsInCourse(courseid).then(function(data){
                $scope.studentsInCourse = data;
                console.log(data);
            });
        }

        function getStudentsNotInCourse(courseid){
            queryService.getStudentsNotInCourse(courseid).then(function(data){
                $scope.studentsNotInCourse = data;
                console.log(data);
            });
        }

        $scope.setView=function(view){
            $scope.view = view;
            viewStack.push(view);
            $scope.errorMessage = '';
        };

        $scope.isView=function(type, view){
            return $scope.userType == type && $scope.view == view;
        };

        $scope.isSharedView = function(view){
            return $scope.view == view;
        };

        function getUserType(i){
            if ($scope.lecturers.indexOf($scope.users[i].userid) != -1) {
                return 'lecturer';
                return;
            }else if($scope.students.indexOf($scope.users[i].userid) != -1){
                return 'student';
            }
            return 'admin';
        }

        $scope.login = function(){
            if($scope.username == "" && $scope.password == ""){
                $scope.loginFailMessage="Username And Password Cannot Be Empty";
            }else if($scope.username == "" && $scope.password != ""){
                $scope.loginFailMessage="Username Cannot Be Empty";
            }else if($scope.password == ""){
                $scope.loginFailMessage="Password Cannot Be Empty";
            }else{
                $scope.validUsername = false;
                $scope.validPassword = false;
                var userIndex = -1;

                for (let i = 0; i < $scope.users.length; i++) {
                    if ($scope.users[i].username == $scope.username) {
                        $scope.validUsername = true;
                        $scope.currentUser = $scope.users[i];
                        userIndex = i;
                        break;
                    }
                }
                if (userIndex >= 0 && $scope.users[userIndex].password == $scope.password) {
                    $scope.validPassword = true;
                }
                if ($scope.validUsername && $scope.validPassword) {
                    $scope.userType = getUserType(userIndex);
                    $scope.setView(2);
                    $scope.cancelLogin();

                }else{
                    $scope.loginFailMessage = "Incorrect Username Or Password. Please Try Again.";
                }
            }
        };

        $scope.$watch('view', function() {
            resetCourse();
        });
        //Logout
        $scope.logout = function(){
            $scope.userType = '';
            $scope.setView(1);
            $scope.cancelLogin();
        };

        $scope.goHome = function(){
            $scope.setView(2);
        };

        $scope.goBack = function(){
            viewStack.splice(-1,1);
            $scope.view = viewStack[viewStack.length - 1];
        };

        $scope.cancelLogin=function(){
            $scope.loginFailMessage="";
            $scope.username="";
            $scope.password="";
        };

        $scope.setCourse = function(course){
            $scope.courseList = [];
            $scope.currentCourse = course;
            $scope.courseCode = course.courseCode;
            $scope.coursesList.push($scope.currentCourse);
            getStudentsInCourse(course.courseid);
            getStudentsNotInCourse(course.courseid);
            $scope.studentsList = $scope.studentsNotInCourse;
            console.log($scope.studentsList);
        };

        $scope.setLecturer = function(lecturer){
            $scope.selectedUser = lecturer;
        };

        $scope.setLecturerId = function(){
            $scope.maxid = 0;
            queryService.getMaxUserId()
                .then(function sucessCall(response)	{
                        $scope.maxid = response.data.data.max;
                        $scope.lecturerId = $scope.maxid + 1;
                    },function errorCall()	{
                        console.log("Error getting max user id.");
                    }
                );
        };

        $scope.$watch('name', function(){
            $scope.lecturerId = $scope.name + $scope.lecturerId;
        });

        $scope.setStudent = function(student){
            $scope.selectedUser = student;

        };

        $scope.setCancelEditStudentView = function(){
            if(viewStack[viewStack.length-2] == 5){
                $scope.setView(5);
            }else{
                $scope.setView(7);
            }
        };

        function resetCourse(){
            $scope.courseList = [];
            $scope.courseCode = '';
        }

        $scope.setAssessment = function(assessment){
            $scope.currentAssessment = assessment;
        };

        $scope.addCourse = function(ev){
            if($scope.courseCode == ''){
                $scope.errorMessage = 'Course Code Cannot Be Empty!';
                return;
            }
            var request = $http.post('/api/createNewCourse', {
                params: {
                    courseCode: $scope.courseCode
                }
            });

            request.then(function success(data){
                getCourses();
                $route.reload();
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = dialogService.confirm($scope.courseCode + ' has been successfully added!',
                    'Would you like to continue adding another course?', 'Added Course', 'Add Another Course', 'Back', ev);

                $scope.courseCode = '';
                $scope.errorMessage = '';
                $mdDialog.show(confirm).then(function() {
                    //Stay on current page
                }, function() {
                    $scope.goBack();
                });
            });
        };

        $scope.addStudent = function(){
            if($scope.studentsList == []){
                $scope.errorMessage = 'Please select at least one student to add to this course.';
                return;
            }
            console.log($scope.studentsList);
            for(let i = 0; i < $scope.studentsList.length; i++){
                $scope.addStudentToCourse($scope.studentsList[i].studentid, $scope.currentCourse.courseid);
            }
            var alert = dialogService.alert('Student(s) have been successfully added to '+ $scope.currentCourse.courseCode +'!',
                'Student(s) Successfully Added', ev);

            $scope.errorMessage = '';

            $mdDialog.show(alert).then(function() {
                $scope.goBack();
            });
        };

        $scope.addNewStudent = function(ev){
            if($scope.studentId == '' || $scope.name == '' || $scope.password == ''){
                $scope.errorMessage = 'Please fill in all fields.';
                return;
            }

            var request = $http.post('/api/createNewUser', {
                params: {
                    username: $scope.studentId,
                    name: $scope.name,
                    password: $scope.password
                }
            });

            request.then(function success(data){
                queryService.getMaxUserId().then(function(response)	{
                        var maxid = response.data.data.max;
                    $http.post('/api/createNewStudent',{
                        params:{
                            userid: maxid,
                            studentid: $scope.studentId
                        }
                    }).then(function success(){
                        getUsers();
                        getStudents();

                        for(let i = 0; i < $scope.coursesList.length; i++){
                            $scope.addStudentToCourse($scope.studentId, $scope.coursesList[i].courseid);
                        }

                        $route.reload();
                        // Appending dialog to document.body to cover sidenav in docs app
                        var confirm = dialogService.confirm($scope.name + ' has been successfully added!', 'Would you like to continue adding another student?',
                            'Added Student', 'Add Another Student', 'Back', ev);

                        $scope.username = '';
                        $scope.studentId = '';
                        $scope.name = '';
                        $scope.password = '';
                        $scope.errorMessage = '';

                        $mdDialog.show(confirm).then(function() {
                            //Stay on current page
                        }, function() {
                            $scope.goBack();
                        });
                    });
                    },function errorCall()	{
                        console.log("Error getting max user id.");
                    }
                );
            });
        };

        $scope.addStudentToCourse = function (studentid, courseid) {
            return $http.post('/api/addStudentToCourse',{
                params:{
                    studentid: studentid,
                    courseid: courseid
                }
            });
        };

        $scope.updateCourse = function(ev){
            if($scope.currentCourse.coursecode == ''){
                $scope.errorMessage = 'Course Code Cannot Be Empty!';
                return;
            }

            var request = $http.post('/api/updateCourse', {
                params: {
                    coursecode: $scope.currentCourse.coursecode,
                    id: $scope.currentCourse.courseid
                }
            });

            request.then(function success(data){
                getCourses();
                $route.reload();
                // Appending dialog to document.body to cover sidenav in docs app
                var alert = dialogService.alert($scope.currentCourse.coursecode + ' has been successfully updated!',
                    'Course Successfully Updated', ev);

                $scope.errorMessage = '';

                $mdDialog.show(alert).then(function() {
                    $scope.goBack();
                });
            });
        };

        $scope.deleteCourse = function(ev){

            var confirm = dialogService.confirm('Are you sure you want to delete this course?', 'Delete Course', 'Yes', 'No', ev);

            $mdDialog.show(confirm).then(function() {
                var request = $http.post('/api/deleteCourse', {
                    params: {
                        id: $scope.currentCourse.courseid
                    }
                });
                request.then(function success(data){
                    $route.reload();
                    // Appending dialog to document.body to cover sidenav in docs app
                    var alert = dialogService.alert($scope.courseCode + ' has been successfully deleted!',
                        'Course Successfully Deleted', ev);

                    $mdDialog.show(alert).then(function() {
                        getCourses();
                        $scope.goBack();
                        $scope.goBack();
                    });
                });
            }, function() {
                //Stay on current page
            });
        };

        $scope.updateUser = function(ev, userType){
            if((userType != 0 && $scope.selectedUser.username == '') || (userType == 0 && $scope.selectedUser.studentid == '') || $scope.selectedUser.name == '' || $scope.selectedUser.password == ''){
                $scope.errorMessage = 'Please fill in all fields.';
                return;
            }

            if(userType == 0){//Student
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

            request.then(function success(data){
                getUsers();
                $route.reload();
                var alert = dialogService.alert($scope.selectedUser.name + ' has been successfully updated!',
                    'User Successfully Updated', ev);
                    // Appending dialog to document.body to cover sidenav in docs app
                if(userType == 0){ //Student
                    var request2 = $http.post('/api/updateStudent', {
                        params: {
                            userid: $scope.selectedUser.userid,
                            studentid: $scope.selectedUser.studentid
                        }
                    }).then(function success(data){
                        getStudents();
                        $mdDialog.show(alert).then(function() {
                            if(userType == 0){//Student
                                $scope.setCancelEditStudentView();
                                getStudents();
                            }else if(userType == 1){//Lecturer

                            }
                        });
                    });
                }else{
                    $mdDialog.show(alert).then(function() {
                        if(userType == 0){//Student
                            $scope.setCancelEditStudentView();
                            getStudents();
                        }else if(userType == 1){//Lecturer
                            $scope.goBack();
                        }
                    });
                }

            });
        };

        $scope.deleteUser = function(ev, userType){
            var confirm = dialogService.confirm('Are you sure you want to delete this ' + $scope.userType +'?', 'Delete user', 'Yes',
                'No', ev);

            $mdDialog.show(confirm).then(function() {
                var request = $http.post('/api/deleteUser', {
                    params: {
                        userid: $scope.selectedUser.userid
                    }
                });
                request.then(function success(data){
                    getUsers();
                    getCourses();

                    // Appending dialog to document.body to cover sidenav in docs app
                    var alert = dialogService.alert($scope.selectedUser.name + ' has been successfully deleted!',
                        'Course Successfully Deleted', ev);
                    $mdDialog.show(alert).then(function() {
                        if(userType == 0){//Student
                            getStudents();
                            $scope.setCancelEditStudentView();
                        }else if(userType == 1){//Lecturer
                            getLecturers();
                            $scope.goBack();
                        }
                    });
                    $route.reload();
                });
            }, function() {
                //Stay on current page
            });
        };
    });
