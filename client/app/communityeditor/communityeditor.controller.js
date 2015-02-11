'use strict';

angular.module('kf6App')
    .controller('CommunityeditorCtrl', function($scope, $stateParams, $http) {
        var communityId = $stateParams.communityId;

        $scope.community = {};

        $http.get('api/communities/' + communityId).success(function(community) {
            $scope.community = community;
        });

        $scope.save = function() {
            $http.put('api/communities/' + communityId, $scope.community).success(function() {
                window.alert('successed.');
            }).error(function() {
                window.alert('failed.');
            });
        };


        $scope.updateAllCash = function() {
            $http.get('/api/links/updateallcache/' + communityId).
            success(function() {
                window.alert('updateing cache successed.');
            });
        };
    });