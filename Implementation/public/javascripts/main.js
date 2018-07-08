/*
var app = angular.module("studentPlanner", ['ngRoute']);

app.controller('mainBodyController', function ($scope, $http) {
    // $http.get('/gettemp').then(function success(response) {
    //     $scope.temp = response.data.rows;
    // });
    $scope.formData = {};
    $scope.todoData = {};

    $http({
        method: 'GET',
        url: '/api/v1/todos'
    }).then(function (response){
        console.log(response.data);
    },function (error){
        console.log("Error: "+ error);
    });

    console.log("Casey");
});

app.controller('KitchenSinkCtrl', function ($scope, $http) {

    console.log("hay hay");
});
*/
