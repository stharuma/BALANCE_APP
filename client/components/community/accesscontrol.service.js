'use strict';

angular.module('kf6App')
    .factory('$ac', function($community, Auth) {
        var obj = {};

        obj.mixIn = function(scope, contribution) {
            scope.isEditable = function() {
                if (!contribution) {
                    return false;
                }
                if (Auth.isAdmin()) {
                    return true;
                }
                return $community.amIAuthor(contribution);
            };
        };

        return obj;
    });