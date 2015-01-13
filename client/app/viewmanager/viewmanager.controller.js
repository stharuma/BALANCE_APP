'use strict';

angular.module('kf6App')
    .controller('ViewmanagerCtrl', function($scope, $http, $community, $state, $stateParams) {
        var communityId = $stateParams.communityId;
        $scope.views = $community.getViews();
        $community.enter(communityId);
        $community.refreshViews();

        $scope.addView = function() {
            if ($scope.newViewTitle === '') {
                return;
            }
            $community.createView($scope.newViewTitle, function() {
                $community.refreshViews();
                $scope.newViewTitle = '';
                //$state.reload();
            });
        };

        /*********** view ************/
        $scope.updateAllCash = function() {
            $http.get('/api/links/updateallcash/' + communityId).
            success(function() {
                window.alert('updateing cash successed.');
            });
        };

        $scope.$on('$destroy', function() {});
    });