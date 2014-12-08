'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope, $http, $stateParams) {
        var contributionId = $stateParams.contributionId;

        $scope.contribution = {};

        $http.get('/api/contributions/' + contributionId).success(function(contribution) {
            $scope.contribution = contribution;
        }).error(function() {});

        $scope.contribute = function() {
            $http.put('/api/contributions/' + contributionId, $scope.contribution).success(function() {
            }).error(function() {
            });
        };

    });