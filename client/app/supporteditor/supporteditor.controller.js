'use strict';

angular.module('kf6App')
    .controller('SupporteditorCtrl', function($scope, $community) {
        $scope.save = function() {
            var support = $scope.selected.support;
            if (!support) {
                return;
            }
            $community.modifyObject(support, function() {
                $scope.showSaved();
                $scope.update(); //update scaffold editor
            });
        };
    });