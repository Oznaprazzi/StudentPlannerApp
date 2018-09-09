var app = angular.module('studentPlanner');
app.controller('calendarController', function(moment, alert, calendarConfig, $rootScope, $scope, queryService) {
    var vm = this;
    vm.calendarView = 'month';
    vm.viewDate = new Date();
    vm.events = [];
    var actions = [{
        label: 'View Details',
        onClick: function (args) {
            $scope.currentAssessment = args.calendarEvent;
            $scope.qs.getTasks($scope.currentAssessment.assessmentid).then(function() {
                $scope.tasks = $scope.qs.tasks();
                $rootScope.setView(9);
            });
        }
    }];

    $scope.qs = queryService;
    async function loadStudent(user){
        await $scope.qs.getStudentsCourses(user.studentid);
        await $scope.qs.getStudentCoupons(user.studentid);
        await $scope.qs.getStudentAssessments(user.studentid);
        $scope.courses = $scope.qs.studentsCourses();
        $rootScope.setEvents($scope.qs.studentAssessments());
    }

    function checkLoggedIn(){
        if (JSON.parse(sessionStorage.getItem('loggedIn'))) {
            $scope.userType = sessionStorage.getItem('userType');
            $scope.user = JSON.parse(sessionStorage.getItem('user'));
            loadStudent($scope.user);
        }
    }

    checkLoggedIn();

    //Calendar
    $rootScope.setEvents = function(assessments){
        if (JSON.parse(sessionStorage.getItem('loggedIn'))) {
            $scope.assessments = assessments;
            $rootScope.transformEvents();
            vm.events = $scope.assessments;
            $rootScope.setView(2);
        }
    }

    $rootScope.dateDiffInDays = function(date1, date2) {
        //date1 and date2 are in UTC format
        dt1 = date1;
        dt2 = new Date(date2);
        return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24)); //divide by ms per day
    }

    $rootScope.transformEvents = function(){
        for(let i = 0; i < $scope.assessments.length; i++){
            if($rootScope.dateDiffInDays( new Date(), $scope.assessments[i].duedate) <= 3){
                $scope.assessments[i].color = calendarConfig.colorTypes.important;
            }else{
                $scope.assessments[i].color = calendarConfig.colorTypes.info;
            }
            $scope.assessments[i].startsAt = new Date($scope.assessments[i].startdate);
            $scope.assessments[i].endsAt = new Date($scope.assessments[i].duedate);
            $scope.assessments[i].draggable = true;
            $scope.assessments[i].resizable = true;
            $scope.assessments[i].actions = actions;
        }
    }

    vm.cellIsOpen = true;

    vm.toggle = function ($event, field, event) {
        $event.preventDefault();
        $event.stopPropagation();
        event[field] = !event[field];
    };

    vm.timespanClicked = function (date, cell) {

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
});
