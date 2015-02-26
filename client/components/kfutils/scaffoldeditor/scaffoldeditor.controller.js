'use strict';

angular.module('kf6App')
    .controller('ScaffoldeditorCtrl', function($scope, $community, $http) {

        $scope.input = {};

        $scope.update = function() {
            $community.fillSupport($scope.contribution);
        };

        $scope.update();

        $scope.addSupport = function() {
            if ($scope.input.supportTitle === '') {
                return;
            }
            if (!$scope.contribution) {
                console.error('contribution is not set.');
                return;
            }
            $community.createSupport($scope.contribution, $scope.input.supportTitle, 100, function() {
                $scope.update();
            });
            $scope.input.supportTitle = '';
        };

        $scope.removeSupport = function(supportref) {
            if (!$scope.contribution) {
                console.error('contribution is not set.');
                return;
            }
            var confirmation = window.confirm('Are you sure to delete ' + supportref.toTitle + '?');
            if (!confirmation) {
                return;
            }
            $http.delete('api/links/' + supportref._id).success(function() {
                $scope.update();
            });
        };

        $scope.selectSupport = function(supportref) {
            var url = 'contribution/' + supportref.to;
            window.open(url, '_blank');
        };

    });