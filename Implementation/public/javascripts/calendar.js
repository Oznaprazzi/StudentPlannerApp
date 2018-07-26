angular.module('mwl.calendar.docs', ['mwl.calendar', 'ngAnimate', 'ui.bootstrap', 'colorpicker.module', 'ngRoute', 'ngMaterial', 'multipleSelect']);
angular
    .module('mwl.calendar.docs') //you will need to declare your module with the dependencies ['mwl.calendar', 'ui.bootstrap', 'ngAnimate']
    .controller('calendarController', function(moment, alert, calendarConfig, $scope, $http, $mdDialog, $route) {
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
        $scope.loginFailMessage = "";
        $scope.userType = '';
        $scope.courseCode = '';
        $scope.currentCourse = '';
        $scope.coursesList = [];

        var viewStack = [];

        getUsers();
        getLecturers();
        getStudents();
        getAssessments();
        getCourses();

        function getUsers(){
            $http.get('/api/getUsers')
                .then(function sucessCall(response)	{
                        $scope.users = response.data.data;
                    },function errorCall()	{
                        console.log("Error reading users list.");
                    }
                );
        }

        function getLecturers(){
            $http.get('/api/getLecturers')
                .then(function sucessCall(response)	{
                        $scope.lecturers = response.data.data;
                    },function errorCall()	{
                        console.log("Error reading lecturers list.");
                    }
                );
        }

        function getStudents(){
            $http.get('/api/getStudents')
                .then(function sucessCall(response)	{
                        $scope.students = response.data.data;
                    },function errorCall()	{
                        console.log("Error reading students list.");
                    }
                );
        }

        function getCourses(){
            $http.get('/api/getCourses')
                .then(function sucessCall(response)	{
                        $scope.courses = response.data.data;
                    },function errorCall()	{
                        console.log("Error reading courses list.");
                    }
                );
        }

        function getAssessments(){
            $http.get('/api/getAssessments')
                .then(function sucessCall(response)	{
                        $scope.assessments = response.data.data;
                    },function errorCall()	{
                        console.log("Error reading assessments list.");
                    }
                );
        }

        function getStudentsInCourse(courseid){
            $http.get('/api/getStudentsInCourse', {
                params: {
                    id: courseid
                }
            }).then(function sucessCall(response)	{
                        $scope.studentsInCourse = response.data.data;
                    },function errorCall()	{
                        console.log("Error reading student in course list.");
                    }
                );
        }

        $scope.setView=function(view){
            $scope.view = view;
            viewStack.push(view);
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
            $scope.currentCourse = course;
            $scope.courseCode = course.courseCode;
            getStudentsInCourse(course.courseid);
        };

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
                var confirm = $mdDialog.confirm()
                    .title($scope.courseCode + ' has been successfully added!')
                    .textContent('Would you like to continue adding another course?')
                    .ariaLabel('Added Course')
                    .targetEvent(ev)
                    .ok('Add Another Course')
                    .cancel('Back');

                $scope.courseCode = '';
                $scope.errorMessage = '';
                $mdDialog.show(confirm).then(function() {
                    //Stay on current page
                }, function() {
                    $scope.goBack();
                });
            });
        };

        $scope.addStudent = function(ev){
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
                $http.post('/api/createNewStudent',{
                    params:{
                        username: $scope.studentId,
                        studentid: $scope.studentId
                    }
                }).then(function success(){
                    getUsers();
                    getStudents();

                    for(let i = 0; i < $scope.coursesList.length; i++){
                        console.log($scope.coursesList[i].courseid);
                        $scope.addStudentToCourse($scope.studentId, $scope.coursesList[i].courseid);
                    }

                    $route.reload();
                    // Appending dialog to document.body to cover sidenav in docs app
                    var confirm = $mdDialog.confirm()
                        .title($scope.name + ' has been successfully added!')
                        .textContent('Would you like to continue adding another student?')
                        .ariaLabel('Added Student')
                        .targetEvent(ev)
                        .ok('Add Another Student')
                        .cancel('Back');

                    $scope.username = '';
                    $scope.studentId = '';
                    $scope.name = '';
                    $scope.password = '';
                    $scope.errorMessage = '';

                    getStudentsInCourse($scope.currentCourse.courseid);
                    $mdDialog.show(confirm).then(function() {
                        //Stay on current page
                    }, function() {
                        $scope.goBack();
                    });
                });
            });
        };

        $scope.addStudentToCourse = function (studentid, courseid) {
            $http.post('/api/addStudentToCourse',{
                params:{
                    studentid: studentid,
                    courseid: courseid
                }
            })
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
                var alert = $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title($scope.currentCourse.coursecode + ' has been successfully updated!')
                    .ariaLabel('Course Successfully Updated')
                    .ok('OK')
                    .targetEvent(ev);

                $scope.errorMessage = '';

                $mdDialog.show(alert).then(function() {
                    $scope.goBack();
                });
            });
        };

        $scope.deleteCourse = function(ev){
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this course?')
                .ariaLabel('Delete Course')
                .targetEvent(ev)
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function() {
                var request = $http.post('/api/deleteCourse', {
                    params: {
                        id: $scope.currentCourse.courseid
                    }
                });
                request.then(function success(data){
                    $route.reload();
                    // Appending dialog to document.body to cover sidenav in docs app
                    var alert = $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title($scope.courseCode + ' has been successfully deleted!')
                        .ariaLabel('Course Successfully Deleted')
                        .ok('OK')
                        .targetEvent(ev);

                    $mdDialog.show(alert).then(function() {
                        getCourses();
                        $scope.goBack();
                        $scope.goBack();
                    });
                });
            }, function() {
                //Stay on current page
            });

        }
    });
