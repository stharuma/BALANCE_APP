'use strict';

angular.module('kf6App')
    .controller('ViewmanagerCtrl', function($scope, $http, $state, socket) {
        $scope.views = [];

        $http.get('/api/views').success(function(views) {
            $scope.views = views;
            //socket.syncUpdates('view', $scope.awesomeThings);
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

        // $scope.deleteThing = function(thing) {
        //   $http.delete('/api/views/' + thing._id);
        // };

        $scope.$on('$destroy', function() {
            //socket.unsyncUpdates('view');
        });
    });