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
            $http.get('/api/onviewrefs/').success(function(onviewrefs) {
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
        /* selection */
        $scope.selected = [];

        $scope.remove = function(arr, item) {
            for (var i = arr.length; i--;) {
                if (arr[i] === item) {
                    arr.splice(i, 1);
                }
            }
        };

        $scope.searchById = function(array, id) {
            for (var i = 0; i < array.length; i++) {
                if (array[i]._id === id) {
                    return array[i];
                }
            }
            return null;
        };

        $scope.getSelectedModels = function() {
            var models = [];
            $scope.selected.forEach(function(eachId) {
                var model = $scope.searchById($scope.onviewrefs, eachId);
                if (model !== null) {
                    models.push(model);
                }
            });
            return models;
        };

        $scope.getSelectedElements = function() {
            var models = [];
            $scope.selected.forEach(function(eachId) {
                var model = $('#' + eachId);
                if (model.size() > 0) {
                    models.push(model.get(0));
                }
            });
            return models;
        };

        $scope.isSelected = function(id) {
            return $scope.selected.indexOf(id) >= 0;
        };

        $scope.select = function(id) {
            if ($scope.isSelected(id)) {
                return;
            }
            $scope.selected.push(id);
            var target = $('#' + id);
            var handles = '<div class="ui-resizable-handle ui-resizable-nw" id="nwgrip"></div><div class="ui-resizable-handle ui-resizable-ne" id="negrip"></div><div class="ui-resizable-handle ui-resizable-sw" id="swgrip"></div><div class="ui-resizable-handle ui-resizable-se" id="segrip"></div>';
            target.append(handles);
            target.resizable({
                handles: {
                    'ne': '#negrip',
                    'se': '#segrip',
                    'sw': '#swgrip',
                    'nw': '#nwgrip'
                }
            });
            $('#selection').append(target);
        };

        $scope.unselect = function(id) {
            if ($scope.isSelected(id) === false) {
                return;
            }
            var target = $('#' + id);
            target.resizable('destroy');
            $('#viewcanvas').append(target);
            $scope.remove($scope.selected, id);
        };

        $scope.clearSelection = function() {
            console.log('clearSelection');
            console.log($scope.selected);
            var copy = $scope.selected.concat();
            copy.forEach(function(each) {
                console.log(each);
                $scope.unselect(each);
            });
        };

        /* drop */
        $scope.dragging2 = 'none';

        $scope.dragover = function(e) {
            if ($scope.dragging2 !== 'none') {
                e.dataTransfer.dropEffect = 'move';
            } else {
                e.dataTransfer.dropEffect = 'copy';
            }
        };

        $scope.drop = function(e, x, y) {
            if ($scope.dragging2 !== 'none') {
                var postref = $scope.dragging2;
                var rect = $('#dropcanvas').get(0).getBoundingClientRect();　
                var dx = (x - rect.left - $scope.dragpoint.x) - postref.x;
                var dy = (y - rect.top - $scope.dragpoint.y) - postref.y;

                $scope.getSelectedModels().forEach(function(postref) {
                    postref.x += dx;　
                    postref.y += dy;
                    $scope.onviewrefSave(postref);
                });
            } else {
                var data = e.dataTransfer.getData('text');
                var index = data.indexOf('postref:');
                if (index !== 0) {
                    return;
                }
                var text = data.replace('postref:', '');
                var models = JSON.parse(text);
                //console.log(ids);
                models.forEach(function(each) {
                    $scope.createPostref(each.postId, null, e.offsetX + each.offsetX, e.offsetY + each.offsetY);
                });

            }
        };

        $scope.onviewrefSave = function(ref) {
            $http.put('/api/onviewrefs/' + ref._id, ref);
        };
    });