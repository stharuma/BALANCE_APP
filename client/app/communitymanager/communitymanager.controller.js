'use strict';

angular.module('kf6App')
    .controller('CommunitymanagerCtrl', function($scope, $http, $state, Auth) {
        $scope.author = Auth.getCurrentUser();
        $scope.selected = {};
        $scope.myCommunities = [];
        $scope.communities = [];
        $scope.newCommunity = {};

        $http.get('/api/communities/my').success(function(myCommunities) {
            $scope.myCommunities = myCommunities;
        });

        $http.get('/api/communities').success(function(communities) {
            $scope.communities = communities;
        });

        $scope.addRegistration = function() {
            var registration = {};
            registration.authorId = $scope.author._id;
            registration.communityId = $scope.selected.community._id;
            registration.role = 'Writer';
            $http.post('/api/registrations', registration).success(function() {
                $state.reload();
            });
        };

        $scope.addNewCommunity = function() {
            if ($scope.newCommunity.title === '' || $scope.newCommunity.code === '') {
                return;
            }
            $http.post('/api/communities', {
                title: $scope.newCommunity.title,
                registrationKey: $scope.newCommunity.code
            });
            $scope.newCommunity = {};
            $state.reload();
        };

        $scope.toTimeString = function(time) {
            if (!time) {
                return '';
            }
            var d = new Date(time);
            return d.toLocaleString();
        };

        $scope.$on('$destroy', function() {});
    });