'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams, Auth) {
        var viewId = $stateParams.viewId;
        $scope.view = {};
        $scope.onviewrefs = [];

        $http.get('/api/views/' + viewId).success(function(view) {
            $scope.view = view;
            $scope.updateCanvas();
        });

        $scope.updateCanvas = function() {
            $http.get('/api/onviewrefs/view/' + viewId).success(function(onviewrefs) {
                $scope.onviewrefs = onviewrefs;
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
                postId: contribution._id,
                viewId: $scope.view._id,
                x: x,
                y: y,
                title: contribution.title,
                authors: contribution.authors
            });
        };

        $scope.onviewrefSave = function(ref) {
            $http.put('/api/onviewrefs/' + ref._id, ref);
        };
    });