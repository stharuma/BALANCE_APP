'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope) {
        var contributionId = $stateParams.contributionId;

        $scope.contribution = {};

        $http.get('/api/contributions/' + contributionId).success(function(contribution) {
            $scope.contribution = contribution;
        });
    });