var app = angular.module("studentPlanner", ['ngRoute']);
app.controller('mainBodyController', function ($scope, $http) {
    $http.get('/gettemp').then(function success(response) {
        $scope.temp = response.data.rows;
    });

    console.log("result " + $scope.temp);
});