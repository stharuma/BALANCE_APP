'use strict';

angular.module('kf6App')
    .factory('$kfutil', function() {
        var obj = {};

        obj.mixIn = function(scope) {
            scope.getTimeString = function(time) {
                var d = new Date(time);
                return d.toLocaleString();
            };
        };

        return obj;
    });