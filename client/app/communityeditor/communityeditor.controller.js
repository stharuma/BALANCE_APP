'use strict';

angular.module('kf6App')
    .controller('CommunityeditorCtrl', function($scope, $stateParams, $http) {
        var communityId = $stateParams.communityId;

        $scope.community = {};

        $http.get('api/communities/' + communityId).success(function(community) {
            $scope.community = community;
        });

        /*********** view ************/
        $scope.updateAllCash = function() {
            $http.get('/api/links/updateallcash/' + communityId).
            success(function() {
                window.alert('updateing cash successed.');
            });
        };
    });