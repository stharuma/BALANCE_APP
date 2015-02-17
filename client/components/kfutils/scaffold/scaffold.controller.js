'use strict';

angular.module('kf6App')
    .controller('ScaffoldCtrl', function($scope, $community) {
        $scope.scaffolds = $community.getScaffolds();
        $community.refreshScaffolds(function() {
            $scope.current = $scope.scaffolds[0];
        });

        $scope.supportClicked = function(supportLink) {
            if (!$scope.addSupport) {
                window.alert('no $scope.addSupport(supportLink) defined.');
                return;
            }
            $scope.addSupport(supportLink);
        };

        $scope.onContextOpen = function(childScope) {
            $scope.contextTarget = childScope.s;
        };

        $scope.openInWindow = function() {
            var url = '/contribution/' + $scope.contextTarget.to;
            window.open(url, '_blank');
        };

        $scope.scaffoldOpenInWindow = function() {
            var url = '/contribution/' + $scope.current._id;
            window.open(url, '_blank');
        };
    });