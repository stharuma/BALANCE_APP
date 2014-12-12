'use strict';

angular.module('kf6App')
    .controller('ScaffoldCtrl', function($scope, $community, $stateParams) {
        var communityId = $stateParams.communityId;
        $community.enter(communityId);
        $scope.scaffolds = $community.getScaffolds();
        $community.refreshScaffolds(function() {
            $scope.current = $scope.scaffolds[0];
        });

        $scope.addSupport = $scope.$parent.addSupport;
    });