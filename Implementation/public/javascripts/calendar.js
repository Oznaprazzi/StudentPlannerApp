var app = angular.module('studentPlanner');
app.controller('calendarController', function(moment, alert, calendarConfig, $rootScope, $scope, queryService, jsFunctionService) {
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
    $scope.fs = jsFunctionService;

    $scope.dangerEvents = []; //list of near dueD date assessments

    $scope.isView = function(userType, view){
        return $scope.fs.userType == userType && $scope.fs.view == view;
    };

    //Calendar
    $rootScope.setEvents = function(assessments){
        if (JSON.parse(sessionStorage.getItem('loggedIn'))) {
            $scope.dangerEvents = [];
            $scope.assessments = assessments;
            $rootScope.transformEvents();
            vm.events = $scope.assessments;
            $rootScope.setView(2);
        }
    };

    $rootScope.dateDiffInDays = function(date1, date2) {
        //date1 and date2 are in UTC format
        dt1 = date1;
        dt2 = new Date(date2);
        return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24)); //divide by ms per day
    };

    $rootScope.transformEvents = function(){
        for(let i = 0; i < $scope.assessments.length; i++){
            if($rootScope.dateDiffInDays(new Date(), $scope.assessments[i].duedate) <= 3 && $rootScope.dateDiffInDays(new Date(), $scope.assessments[i].duedate) >= 0){
                $scope.assessments[i].color = calendarConfig.colorTypes.important;
                $scope.dangerEvents.push($scope.assessments[i]);
            }else if($rootScope.dateDiffInDays(new Date(), $scope.assessments[i].duedate) < 0){
                $scope.assessments[i].color = calendarConfig.colorTypes.special;
            }else{
                $scope.assessments[i].color = calendarConfig.colorTypes.info;
            }
            $scope.assessments[i].title = $scope.assessments[i].coursecode + " " + $scope.assessments[i].title;
            $scope.assessments[i].startsAt = new Date($scope.assessments[i].startdate);
            $scope.assessments[i].endsAt = new Date($scope.assessments[i].duedate);
            $scope.assessments[i].draggable = true;
            $scope.assessments[i].resizable = true;
            $scope.assessments[i].actions = actions;
        }
    };

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
