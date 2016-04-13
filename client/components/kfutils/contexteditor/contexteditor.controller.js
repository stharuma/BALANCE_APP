'use strict';

angular.module('kf6App')
    .controller('ContexteditorCtrl', function($scope, $community) {

        $scope.viewSetting = {};

        $scope.viewsettingEnabledChanged = function() {
            if ($scope.viewSetting.enabled) {
                $scope.contribution.data.viewSetting = $community.makeDefaultViewSetting();
            } else {
                $scope.contribution.data.viewSetting = null;
            }
        };

        $scope.update = function() {
            if (!$scope.contribution.data) {
                $scope.contribution.data = {};
            }
            if ($scope.contribution.data.viewSetting) {
                $scope.viewSetting.enabled = true;
            }
            if (!$scope.contribution.data.plugins) {
                $scope.contribution.data.plugins = {};
            }
        };

        if (!$scope.initializingHooks) {
            window.alert('error !$scope.initializingHooks');
        }
        $scope.initializingHooks.push(function() {
            $scope.update();
        });

        $scope.openScaffoldManager = function() {
            var url = '/scaffoldmanager/' + $scope.contribution.communityId;
            window.open(url, '_scaffoldmanager');
        };

    });
