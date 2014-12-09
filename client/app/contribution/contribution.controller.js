'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope, $http, $member, $stateParams) {
        var contributionId = $stateParams.contributionId;

        $scope.contribution = {};
        $scope.authors = [];
        $scope.records = [];
        $scope.communityMembers = [];

        $http.get('/api/contributions/' + contributionId).success(function(contribution) {
            $scope.contribution = contribution;
            $scope.contribution.authors.forEach(function(authorId) {
                $scope.authors.push($member.getMember(authorId));
            });
            window.setTimeout(function() {
                $http.post('/api/records/read/' + contributionId);
            }, 3000);
            $scope.updateRecords();
            $scope.communityMembers = $member.getMembers();
            $member.updateCommunityMembers();
        }).error(function() {});

        $scope.contribute = function() {
            $scope.contribution.authors = _.pluck($scope.authors, '_id');
            $http.put('/api/contributions/' + contributionId, $scope.contribution).success(function() {}).error(function() {});
        };

        $scope.updateRecords = function() {
            $http.get('/api/contributions/records/' + contributionId).success(function(records) {
                $scope.records = records;
                $scope.records.forEach(function(record) {
                    record.user = $member.getMember(record.authorId);
                    record.getTime = function() {
                        var d = new Date(record.timestamp);
                        return d.toLocaleString();
                    };
                });
            });
        };

        $scope.addAuthor = function(author) {
            if (_.contains($scope.authors, author)) {
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