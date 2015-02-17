'use strict';

angular.module('kf6App')
    .controller('ScaffoldeditorCtrl', function($scope, $community, $http) {

        $scope.supports = [];
        $scope.input = {};

        $scope.update = function() {
            if (!$scope.selected) {
                return;
            }
            var scaffold = $scope.selected.scaffold;
            if (!scaffold) {
                return;
            }
            $community.fillSupport(scaffold);
            $scope.supports = scaffold.supports;
        };

        $scope.update();

        $scope.addSupport = function() {
            if ($scope.input.supportTitle === '') {
                return;
            }
            var scaffold = $scope.selected.scaffold;
            $community.createSupport(scaffold, $scope.input.supportTitle, 100, function() {
                $community.fillSupport(scaffold, function() {
                    $scope.supports = scaffold.supports;
                });
            });
            $scope.input.supportTitle = '';
        };

        $scope.removeSupport = function(supportref) {
            var confirmation = window.confirm('Are you sure to delete ' + supportref.toTitle + '?');
            if (!confirmation) {
                return;
            }
            $http.delete('api/links/' + supportref._id).success(function() {

            });
            $scope.save();
        };

        $scope.selectSupport = function(supportref) {
            $community.getObject(supportref.to, function(support) {
                $scope.selected.support = support;
            });
        };

        $scope.saveScaffold = function() {
            $scope.save();
        };

        $scope.save = function() {
            var scaffold = $scope.selected.scaffold;
            if (!scaffold) {
                return;
            }
            $community.modifyObject(scaffold, function() {
                $scope.showSaved();
                $scope.update();
            });
        };
    });