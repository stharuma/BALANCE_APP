'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope, $http, $stateParams) {
        var contributionId = $stateParams.contributionId;

        $scope.contribution = {};

        $http.get('/api/notes/' + contributionId).success(function(contribution) {
        	console.log(contribution);
            $scope.contribution = contribution;
        });
    });