'use strict';
angular.module('functions', []).service('jsFunctionService', function(){
    this.view = 1;
    this.viewStack = [];
    this.userType = "";

    this.setView = function(view){
        this.view = view;
        if(this.view != this.viewStack[this.viewStack.length -1]){
            this.viewStack.push(view);
        }
    };
});