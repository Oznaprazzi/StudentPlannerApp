angular.module('mwl.calendar.docs', ['mwl.calendar', 'ngAnimate', 'ui.bootstrap', 'colorpicker.module', 'ngRoute']);
angular
    .module('mwl.calendar.docs') //you will need to declare your module with the dependencies ['mwl.calendar', 'ui.bootstrap', 'ngAnimate']
    .controller('calendarController', function(moment, alert, calendarConfig, $scope, $http) {
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
        $scope.type = "";

        $http.get('/api/getUsers')
            .then(function sucessCall(response)	{
                    $scope.users = response.data.data;
                },function errorCall()	{
                    console.log("Error reading users list.");
                }
            );

        $http.get('/api/getLecturers')
            .then(function sucessCall(response)	{
                    $scope.lecturers = response.data.data;
                },function errorCall()	{
                    console.log("Error reading users list.");
                }
            );

        $http.get('/api/getStudents')
            .then(function sucessCall(response)	{
                    $scope.students = response.data.data;
                },function errorCall()	{
                    console.log("Error reading users list.");
                }
            );

        $scope.setView=function(type, view){
            $scope.type = type;
            $scope.view = view;
        };

        $scope.isView=function(type, view){
            return $scope.type == type && $scope.view == view;
        };

        function getUserType(i){
            if ($scope.lecturers.indexOf($scope.users[i].userid) != -1) {
                return 'lecturer';
            }else if($scope.students.indexOf($scope.users[i].userid) != -1){
                return 'student';
            }
            return 'admin';
        }

        $scope.login = function(){
            if($scope.username == "" && $scope.password == ""){
                $scope.print="Please input a valid username and password";
            }else if($scope.username == "" && $scope.password != ""){
                $scope.print="Please input a valid username";
            }else if($scope.password == ""){
                $scope.print="Please input a valid password";
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
                    $scope.setView(getUserType(userIndex), 2);
                    $scope.cancelLogin();

                }else{
                    $scope.print = "Incorrect username or password";
                }
            }
        };

        //Logout
        $scope.logout=function(){
            $scope.setView('', 1);
        };

        $scope.cancelLogin=function(){
            $scope.print="";
            $scope.username="";
            $scope.password="";
        };

        $scope.addNewStudent = function(){
            var formData = {
                name: $scope.username,
                password: $scope.password
            };
            console.log($scope.username);
            console.log($scope.password);
            var request = $http.post('/api/createNewUser', {
                params: {
                    name: $scope.username,
                    password: $scope.password
                }
            });

            request.then(function success(data){
                $http.post('/api/createNewStudent');
            });
        }
    });
