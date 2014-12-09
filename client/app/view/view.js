'use strict';

angular.module('kf6App')
    .config(function($stateProvider) {
        $stateProvider
            .state('view', {
                url: '/view/:viewId',
                templateUrl: 'app/view/view.html',
                controller: 'ViewCtrl'
            });
    });

angular.module('kf6App')
    .directive('KFViewRef', function() {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var ref = scope.ref;
                var $scope = scope.$parent;

                var el = element[0];
                el.draggable = true;
                element.on('mousedown', function(e) {
                    var pid = ref._id;
                    var selected = $scope.isSelected(pid);
                    if (e.shiftKey) {
                        if (selected) {
                            $scope.unselect(pid);
                        } else {
                            $scope.select(pid);
                        }
                    } else {
                        if (selected) {
                            // do nothing
                        } else {
                            $scope.clearSelection();
                            $scope.select(pid);
                        }
                    }
                });
                el.addEventListener('dragstart', function(e) {
                    var firefox = (e.offsetX === undefined);
                    var safari = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1;

                    var offset = {
                        x: firefox ? e.layerX : e.offsetX,
                        y: firefox ? e.layerY : e.offsetY
                    };

                    $scope.dragpoint = offset;

                    if (safari) {
                        var imgX = element.position().left + offset.x;
                        var imgY = element.position().top + offset.y;
                        var selImg = selection.get(0);
                        e.dataTransfer.setDragImage(selImg, imgX, imgY);
                    }

                    var models = $scope.getSelectedModels();
                    models.forEach(function(each) {
                        each.offsetX = each.x - ref.x;
                        each.offsetY = each.y - ref.y;
                    });
                    e.dataTransfer.setData('text', 'postref:' + JSON.stringify(models));
                    var hrefs = '';
                    models.forEach(function(each) {
                        hrefs += '<a href="note/' + each.postId + '">';
                        hrefs += each.title;
                        hrefs += '</a>';
                    });
                    e.dataTransfer.setData('text/html', hrefs);
                    $scope.dragging2 = ref;
                });
                el.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    $scope.dragover(e);
                });
                el.addEventListener('drop', function(e) {
                    e.preventDefault();
                    $scope.drop(e, e.clientX, e.clientY);
                });
                el.addEventListener('dragend', function() {
                    $scope.dragging2 = 'none';
                });
            }
        };
    });

angular.module('kf6App')
    .directive('KFViewDropCanvas', function() {
        return {
            restrict: 'C',
            link: function(scope) {
                var $scope = scope;
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
                    var copy = $scope.selected.concat();
                    copy.forEach(function(each) {
                        $scope.unselect(each);
                    });
                };
            }
        };
    });

angular.module('kf6App')
    .directive('KFViewDropCanvas', function() {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var $scope = scope;
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
                        models.forEach(function(each) {
                            $scope.createPostref(each.postId, null, e.offsetX + each.offsetX, e.offsetY + each.offsetY);
                        });
                    }
                };

                var el = element[0];
                el.droppable = true;
                el.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    $scope.dragover(e);
                });
                el.addEventListener('drop', function(e) {
                    e.preventDefault();
                    $scope.drop(e, e.clientX, e.clientY);
                });
            }
        };
    });