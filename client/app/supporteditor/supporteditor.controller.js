'use strict';

angular.module('kf6App')
    .controller('SupporteditorCtrl', function($scope, $http) {
        $scope.save = function() {
            var support = $scope.selected.support;
            if (!support) {
                return;
            }
            $http.put('/api/contributions/' + support._id, support).success(function() {
                $scope.showSaved();
                $scope.update(); //update scaffold editor
            });
        };
    });