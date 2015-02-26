'use strict';

angular.module('kf6App')
    .controller('AuthormanagerCtrl', function($scope, $community, $stateParams, $state) {
        $scope.getManagers = function() {
            var authors = $community.getCommunityData().membersArray;
            return _.filter(authors, function(elem) {
                return elem.role === 'manager';
            });
        };
        if ($stateParams.communityId) {
            $community.enter($stateParams.communityId, function() {
                $community.refreshMembers(function() {});
            });
        }

        $scope.authorSelected = function(author) {
            $scope.addToManager(author);
        };

        $scope.addToManager = function(author) {
            if (author.role === 'manager') {
                window.alert('The author is already manager.');
                return;
            }

            var seed = _.extend({}, author);
            seed.role = 'manager';
            $community.modifyObject(seed, function() {
                $state.reload();
            }, function(err) {
                window.alert(err);
            });
        };

        $scope.removeFromManager = function(author) {
            if (author.role !== 'manager') {
                window.alert('The author is not a manager.');
                return;
            }

            if (author._id === $community.getCommunityData().author._id) {
                window.alert('You cannot make yourself a writer.');
                return;
            }

            var seed = _.extend({}, author);
            seed.role = 'manager';
            seed.role = 'writer';
            $community.modifyObject(seed, function() {
                $state.reload();
            }, function(err) {
                window.alert(err);
            });
        };
    });