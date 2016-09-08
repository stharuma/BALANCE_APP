'use strict';

angular.module('kf6App')
    .controller('ViewmanagerCtrl', function($scope, $http, $community, $state, $stateParams, $ac) {
        var communityId = $stateParams.communityId;
        $ac.mixIn($scope);

        if (!$scope.views) {
            $scope.views = [];
        }
        $scope.input = {};
        $scope.input.title = '';
        $scope.input.editMode = false;
        $community.enter(communityId);
        $community.refreshViews(function() {
            $scope.views = $community.getViews();
        });

        $scope.addView = function() {
            if ($scope.input.title === '') {
                return;
            }
            $community.createView($scope.input.title, function() {
                $community.refreshViews(function() {
                    $scope.views = $community.getViews();
                });
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
