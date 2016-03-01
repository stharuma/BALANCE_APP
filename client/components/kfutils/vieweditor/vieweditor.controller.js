'use strict';

angular.module('kf6App')
    .controller('VieweditorCtrl', function($scope, $community) {
        $scope.setting = {};

        $scope.viewsettingEnabledChanged = function() {
            if ($scope.setting.viewSettingEnabled) {
                $scope.contribution.data.viewSetting = $community.makeDefaultViewSetting();
            } else {
                $scope.contribution.data.viewSetting = null;
            }
        };

        $scope.update = function() {
            if ($scope.contribution.data && $scope.contribution.data.viewSetting) {
                $scope.setting.viewSettingEnabled = true;
            }
            $community.getContext($scope.contribution._id, function(context) {
                $scope.rootContext = context;
            });
        };

        if (!$scope.initializingHooks) {
            window.alert('error !$scope.initializingHooks');
        }
        $scope.initializingHooks.push(function() {
            $scope.update();
        });

        $scope.openRootContext = function() {
            var url = '/contribution/' + $scope.rootContext._id;
            window.open(url, '_rootcontext');
        };

    });
