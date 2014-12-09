'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope, $http, $stateParams) {
        var contributionId = $stateParams.contributionId;

        $scope.contribution = {};
        $scope.authors = [];
        $scope.communityMembers = [];

        $http.get('/api/contributions/' + contributionId).success(function(contribution) {
            $scope.contribution = contribution;
            $scope.updateCommunityMembers();
        }).error(function() {});

        $scope.contribute = function() {
            $scope.contribution.authors = _.pluck($scope.authors, '_id');
            $http.put('/api/contributions/' + contributionId, $scope.contribution).success(function() {}).error(function() {});
        };

        $scope.updateCommunityMembers = function() {
            $http.get('/api/users/').success(function(members) {
                $scope.communityMembers = members;
            });
        };

        $scope.addAuthor = function(author) {
            if (_.contains($scope.authors, author)){
                window.alert('already included');
                return;
            }
            $scope.authors.push(author);
        };


        $scope.removeAuthor = function(author) {
            var index = $scope.authors.indexOf(author);
            if (index === 0) {
                window.alert('cannot remove the Primary Author');
                return;
            }
            if (index >= 0) {
                $scope.authors.splice(index, 1);
            }
        };
    });