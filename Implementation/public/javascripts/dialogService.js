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

    this.addTaskPrompt = function(DialogController) {
        // Appending dialog to document.body to cover sidenav in docs app
        return {
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            template:
            '<md-dialog>' +
            '  <md-dialog-content>'+
            '   <md-content layout-padding>'+
            '       <md-input-container>\n' +
            '           <label>Description*</label>\n' +
            '           <input ng-model="description">\n' +
            '       </md-input-container>'+
            '       <md-input-container>\n' +
            '           <label>Points</label>\n' +
            '           <input ng-model="points">\n' +
            '       </md-input-container>'+
            '       <div layout="row">'+
            '	        <md-button ng-click="closeDialog()" style="float: right">Cancel</md-button>'+
            '	        <md-button ng-click="saveTask($event)" style="float: right">Save</md-button>'+
            '       </div>'+
            '   </md-content>'+
            '  </md-dialog-content>' +
            '</md-dialog>',
            locals: {

            },
            controller: DialogController
        }
    };

    this.editTaskPrompt = function(DialogController) {
        // Appending dialog to document.body to cover sidenav in docs app
        return {
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            template:
            '<md-dialog>' +
            '  <md-dialog-content>'+
            '   <md-content layout-padding>'+
            '       <md-input-container>\n' +
            '           <label>Description*</label>\n' +
            '           <input ng-model="task.description">\n' +
            '       </md-input-container>'+
            '       <md-input-container>\n' +
            '           <label>Points</label>\n' +
            '           <input ng-model="task.points">\n' +
            '       </md-input-container>'+
            '       <div layout="row">'+
            '	        <md-button ng-click="closeDialog()" style="float: right">Cancel</md-button>'+
            '	        <md-button ng-click="updateTask($event)" style="float: right">Save</md-button>'+
            '       </div>'+
            '   </md-content>'+
            '  </md-dialog-content>' +
            '</md-dialog>',
            locals: {

            },
            controller: DialogController
        }
    };
});