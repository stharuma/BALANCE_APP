'use strict';

angular.module('kf6App')
    .controller('CommunitymanagerCtrl', function($scope, $http, $state) {
        $scope.communities = [];

        $http.get('/api/communities').success(function(communities) {
            $scope.communities = communities;
        });

        $scope.addNew = function() {
        	console.log($scope.newTitle);
            if ($scope.newTitle === '') {
                return;
            }
            $http.post('/api/communities', {
                title: $scope.newTitle
            });
            $scope.newTitle = '';
            $state.reload();
        };

        $scope.$on('$destroy', function() {});
    });