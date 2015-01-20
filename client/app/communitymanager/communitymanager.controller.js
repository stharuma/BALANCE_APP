'use strict';

angular.module('kf6App')
    .controller('CommunitymanagerCtrl', function($scope, $http, $state, Auth) {
        $scope.author = Auth.getCurrentUser();
        $scope.selected = {};
        $scope.myCommunities = [];
        $scope.communities = [];
        $scope.newCommunity = {};
        $scope.isAdmin = Auth.isAdmin;

        $http.get('/api/communities/my').success(function(myCommunities) {
            $scope.myCommunities = myCommunities;
        });

        $http.get('/api/communities').success(function(communities) {
            $scope.communities = communities;
        });

        $scope.addRegistration = function() {
            if (!$scope.selected.community) {
                window.alert('Community must be selected');
                return;
            }
            var registration = {};
            registration.authorId = $scope.author._id;
            registration.communityId = $scope.selected.community._id;
            registration.registrationKey = $scope.selected.key;
            registration.role = 'Writer';
            $http.post('/api/registrations', registration).success(function() {
                $state.reload();
            }).error(function(msg) { //function(data, status, headers, config)
                window.alert('Error: ' + msg);
            });
        };

        $scope.addNewCommunity = function() {
            if (!$scope.newCommunity.title || $scope.newCommunity.title === '') {
                window.alert('Title must be input');
                return;
            }
            if (!$scope.newCommunity.key || $scope.newCommunity.key === '') {
                window.alert('RegistrationKey must be input');
                return;
            }
            $http.post('/api/communities', {
                title: $scope.newCommunity.title,
                registrationKey: $scope.newCommunity.key
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