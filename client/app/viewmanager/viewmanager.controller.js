'use strict';

angular.module('kf6App')
    .controller('ViewmanagerCtrl', function($scope, $http, $community, $state, $stateParams) {
        var communityId = $stateParams.communityId;
        $scope.views = $community.getViews();
        $scope.input = {};
        $scope.input.title = '';
        $scope.input.editMode = false;
        $community.enter(communityId);
        $community.refreshViews();

        $scope.addView = function() {
            if ($scope.input.title === '') {
                return;
            }
            $community.createView($scope.input.title, function() {
                $community.refreshViews();
                //$state.reload();
            });
            $scope.input.title = '';
        };

        $scope.removeView = function(view) {
            var confirmation = window.confirm('Are you sure to delete ' + view.title + '?');
            if (!confirmation) {
                return;
            }
            $community.removeView(view, function() {
                $community.refreshViews();
            });
        };

        $scope.$on('$destroy', function() {});
    });