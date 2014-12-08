'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams) {
        var viewId = $stateParams.viewId;
        $scope.view = {};

        $http.get('/api/views/' + viewId).success(function(view) {
            $scope.view = view;
        });
    });