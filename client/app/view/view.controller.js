'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams, socket, Auth) {
        var viewId = $stateParams.viewId;
        $scope.view = {};
        $scope.refs = [];

        $http.get('/api/views/' + viewId).success(function(view) {
            $scope.view = view;
            $scope.updateCanvas();
        });

        $scope.updateCanvas = function() {
            $http.get('/api/onviewrefs/view/' + viewId).success(function(refs) {
                $scope.refs = refs;
                socket.socket.emit('subscribe', viewId);
                $scope.$on('$destroy', function() {
                    socket.socket.emit('unsubscribe', viewId);
                    socket.unsyncUpdates('ref');
                });
                socket.syncUpdates('ref', $scope.refs);
            });
        };

        $scope.createNote = function() {
            var authors = [Auth.getCurrentUser()._id];
            $http.post('/api/notes', {
                    title: 'New Note',
                    body: '',
                    authors: authors
                })
                .success(function(note) {
                    $scope.createOnViewRef(note, 100, 100);
                });
        };

        $scope.createOnViewRef = function(contribution, x, y) {
            $http.post('/api/onviewrefs', {
                contributionId: contribution._id,
                viewId: $scope.view._id,
                x: x,
                y: y,
                title: contribution.title,
                authors: contribution.authors
            });
        };

        $scope.updateRef = function(ref) {
            $http.put('/api/onviewrefs/' + ref._id, ref);
        };

        $scope.openContoribution = function(id) {
            var url = './contribution/' + id;
            window.open(url, '_blank');
        };

    });