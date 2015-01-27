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
            $http.post('/api/contributions', {
                communityId: scaffold.communityId,
                title: $scope.input.supportTitle,
                type: 'Support'
            }).success(function(support) {
                var ref = {};
                ref.to = support._id;
                ref.from = scaffold._id;
                ref.type = 'contains';
                $http.post('/api/links', ref).success(function() {
                    $community.fillSupport(scaffold);
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
            $http.get('api/contributions/' + supportref.to).success(function(support) {
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
            $http.put('/api/contributions/' + scaffold._id, scaffold).success(function() {
                $scope.showSaved();
                $scope.update();
            });
        };
    });