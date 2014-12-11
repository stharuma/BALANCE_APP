'use strict';

angular.module('kf6App')
    .controller('ViewmanagerCtrl', function($scope, $http, $state) {
        $scope.views = [];

        $http.get('/api/views').success(function(views) {
            $scope.views = views;
        });

        $scope.addView = function() {
            if ($scope.newViewTitle === '') {
                return;
            }
            $http.post('/api/views', {
                title: $scope.newViewTitle
            });
            $scope.newViewTitle = '';
            $state.reload();
        };

        $scope.$on('$destroy', function() {
        });
    });