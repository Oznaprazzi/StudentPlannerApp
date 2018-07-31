'use strict';
var serv = angular.module('dialogs', ['ngMaterial']);
serv.service('dialogService', function($mdDialog){
    this.alert = function(title, ariaLabel, ev){
        return $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title(title)
            .ariaLabel(ariaLabel)
            .ok('OK')
            .targetEvent(ev);
    };

    this.confirm = function(title, ariaLabel, ok, cancel, ev){
        return $mdDialog.confirm()
            .title(title)
            .ariaLabel(ariaLabel)
            .targetEvent(ev)
            .ok(ok)
            .cancel(cancel);
    };
});