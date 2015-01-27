'use strict';

angular.module('kf6App')
    .controller('ScaffoldmanagerCtrl', function($scope, $stateParams, $community) {
        if ($stateParams.communityId) {
            $community.enter($stateParams.communityId);
        }
        $scope.scaffolds = $community.getScaffolds();
        $community.refreshScaffolds(function() {});

        $scope.addScaffold = function() {
            if ($scope.input.scaffoldTitle === '') {
                return;
            }
            $community.createScaffold($scope.input.scaffoldTitle, function() {
                $community.refreshScaffolds(function() {});
                //$state.reload();                
            });
            $scope.input.scaffoldTitle = '';
        };

        $scope.removeScaffold = function(scaffold) {
            var confirmation = window.confirm('Are you sure to delete ' + scaffold.title + '?');
            if (!confirmation) {
                return;
            }
            _.remove($scope.scaffolds, function(n) {
                return n._id === scaffold._id;
            });
            $scope.save();
        };

        $scope.saveOrder = function() {
            $scope.save();
        };

        $scope.save = function() {
            var community = {};
            community.scaffolds = _.pluck($scope.scaffolds, '_id');
            $community.updateCommunity(community, function() {
                $community.refreshScaffolds(function() {});
            });
        };
    });