'use strict';

angular.module('kf6App')
    .controller('CommunitymanagerCtrl', function($scope, $http, $state, Auth) {
        $scope.author = Auth.getCurrentUser();
        $scope.selected = {};
        $scope.myCommunities = [];
        $scope.communities = [];

        $http.get('/api/communities/my').success(function(myCommunities) {
            $scope.myCommunities = myCommunities;
        });

        $http.get('/api/communities').success(function(communities) {
            $scope.communities = communities;
        });

        $scope.addNew = function() {
            if ($scope.newTitle === '') {
                return;
            }
            $http.post('/api/communities', {
                title: $scope.newTitle
            });
            $scope.newTitle = '';
            $state.reload();
        };

        $scope.addRegistration = function() {
            var registration = {};
            registration.authorId = $scope.author._id;
            registration.communityId = $scope.selected.community._id;
            registration.role = 'Writer';
            $http.post('/api/registrations', registration).success(function() {
                $state.reload();
            });
        };

        $scope.toTimeString = function(time) {
            if(!time){
                return '';
            }
            var d = new Date(time);
            return d.toLocaleString();
        };

        $scope.$on('$destroy', function() {});
    });