/* global jsPlumb */

'use strict';

angular.module('kf6App')
    .config(function($stateProvider) {
        $stateProvider
            .state('view', {
                url: '/view/:viewId',
                templateUrl: 'app/view/view.html',
                controller: 'ViewCtrl'
            });
        $stateProvider
            .state('viewWithMenuStatus', {
                url: '/view/:viewId/:menuStatus',
                templateUrl: 'app/view/view.html',
                controller: 'ViewCtrl'
            });
    });

angular.module('kf6App')
    .directive('viewlink', function() {
        return {
            restrict: 'A',
            link: function(scope, element) {
                var $scope = scope.$parent;
                var el = element[0];
                el.draggable = true;
                el.addEventListener('dragstart', function() {
                    $scope.draggingViewlink = scope.view;
                });
            }
        };
    });

angular.module('kf6App')
    .directive('KFViewRef', function() {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var ref = scope.ref;
                var $scope = scope.$parent;
                var el = element[0];

                scope.$watch('ref.data.x', function() {
                    jsPlumb.repaintEverything();
                });
                scope.$watch('ref.data.y', function() {
                    jsPlumb.repaintEverything();
                });
                scope.$on('$destroy', function() {
                    $scope.detachAllConnections('icon' + ref._id);
                });

                ref.refreshFixedStatus = function() {
                    if (ref.data.fixed === true) {
                        element.css('z-index', 3);
                        el.draggable = false;
                    } else {
                        element.css('z-index', 5);
                        el.draggable = true;
                    }
                };
                ref.refreshFixedStatus();
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
                    //var chrome = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') > -1;                    
                    var IE = (navigator.userAgent.indexOf('MSIE') !== -1 || document.documentMode <= 11); /*IE11*/

                    var offset = {
                        x: firefox ? e.layerX : e.offsetX,
                        y: firefox ? e.layerY : e.offsetY
                    };

                    if (safari /*|| (chrome && $scope.selected.length >= 2)*/ ) {
                        var imgX = element.position().left + offset.x;
                        var imgY = element.position().top + offset.y;
                        var selImg = $('#selectioncanvas').get(0);
                        e.dataTransfer.setDragImage(selImg, imgX, imgY);
                    }

                    var models = $scope.getSelectedModels();
                    models.forEach(function(each) {
                        each.offsetX = each.data.x - ref.data.x;
                        each.offsetY = each.data.y - ref.data.y;
                    });
                    e.dataTransfer.setData('text', 'postref:' + JSON.stringify(models));
                    var hrefs = '';
                    models.forEach(function(each) {
                        hrefs += '<a href="note/' + each.postId + '">';
                        hrefs += each.title;
                        hrefs += '</a>';
                    });
                    if (!IE) {
                        e.dataTransfer.setData('text/html', hrefs);
                    }

                    $scope.dragging = ref;
                    $scope.dragpoint = offset;
                });
                el.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    $scope.dragover(e);
                });
                el.addEventListener('drop', function(e) {
                    e.preventDefault();
                    $scope.drop(e, ref);
                });
                el.addEventListener('dragend', function() {
                    $scope.dragging = 'none';
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
                        var model = $scope.searchById($scope.refs, eachId);
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
                    var ref = $scope.searchById($scope.refs, id);
                    if (ref.data.fixed === true) {
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
                        },
                        stop: function() {
                            $scope.getSelectedModels().forEach(function(ref) {
                                if (ref._id === id) {
                                    ref.data.width = target.width();
                                    ref.data.height = target.height();
                                    $scope.saveRef(ref);
                                }
                            });
                        }
                    });
                    target.resizable();
                    $('#selectioncanvas').append(target);
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

                $scope.dragover = function(e) {
                    if ($scope.dragging !== 'none') {
                        e.dataTransfer.dropEffect = 'move';
                    } else {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                };

                $scope.drop = function(e, ref) {
                    var newX = e.offsetX;
                    var newY = e.offsetY;
                    if (ref) {
                        newX = newX + ref.data.x;
                        newY = newY + ref.data.y;
                    }

                    if ($scope.draggingViewlink) {
                        var view = $scope.draggingViewlink;
                        $scope.createOnViewRef(view, {
                            x: newX,
                            y: newY
                        });
                        $scope.draggingViewlink = null;
                        return;
                    }
                    if ($scope.dragging !== 'none') { //Internal DnD
                        var postref = $scope.dragging;
                        var dx = newX - postref.data.x - $scope.dragpoint.x;
                        var dy = newY - postref.data.y - $scope.dragpoint.y;

                        $scope.getSelectedModels().forEach(function(postref) {
                            postref.data.x += dx;
                            postref.data.y += dy;
                            $scope.saveRef(postref);
                        });
                    } else { //External DnD
                        var data = e.dataTransfer.getData('text');
                        var index = data.indexOf('postref:');
                        if (index !== 0) {
                            return;
                        }
                        var text = data.replace('postref:', '');
                        var models = JSON.parse(text);
                        models.forEach(function(each) {
                            $scope.createOnViewRefById(each.to, {
                                x: newX + each.offsetX,
                                y: newY + each.offsetY
                            });
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
                    $scope.drop(e, null);
                });
            }
        };
    });

angular.module('kf6App')
    .directive('KFViewMarqueeCanvas', function() {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var marquee = null;
                var pressX;
                var pressY;

                element.on('mousedown', function(e) {
                    if (e.ctrlKey) {
                        return;
                    }
                    if (marquee !== null) {
                        marquee.remove();
                        marquee = null;
                    }
                    element.css('zIndex', 100);
                    pressX = e.clientX - element.offset().left;
                    pressY = e.clientY - element.offset().top;
                    element.append('<div id="marquee" style="position: absolute; width: 1px; height: 1px; border-style: dashed; border-width: 1pt; border-color: #000000;"></div>');
                    marquee = $('#marquee');
                });

                element.on('mousemove', function(e) {
                    if (marquee === null) {
                        return;
                    }
                    var px = pressX + element.offset().left;
                    var py = pressY + element.offset().top;
                    var x = Math.min(e.clientX, px);
                    var y = Math.min(e.clientY, py);
                    var w = Math.abs(e.clientX - px);
                    var h = Math.abs(e.clientY - py);
                    marquee.offset({
                        left: x,
                        top: y
                    });
                    marquee.width(w);
                    marquee.height(h);
                });

                element.on('mouseup', function() {
                    if (marquee === null) {
                        return;
                    }
                    var marqueeRect = j2rect(marquee);
                    $('.KFViewRef').each(function() {
                        if (intersects(marqueeRect, j2rect($(this)))) {
                            scope.select($(this).attr('id'));
                        } else {
                            scope.unselect($(this).attr('id'));
                        }
                    });
                    marquee.remove();
                    marquee = null;
                    element.css('zIndex', 2);
                });

                function intersects(r1, r2) {
                    return !(r2.left > r1.right ||
                        r2.right < r1.left ||
                        r2.top > r1.bottom ||
                        r2.bottom < r1.top);
                }

                function j2rect(j) {
                    return {
                        left: j.offset().left,
                        top: j.offset().top,
                        right: j.offset().left + j.width(),
                        bottom: j.offset().top + j.height()
                    };
                }
            }
        };
    });