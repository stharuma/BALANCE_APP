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
    .directive('onviewref', function() {
        return {
            restrict: 'A',
            link: function(scope, element) {
                var ref = scope.ref;

                var el = element[0];
                el.draggable = true;
                element.on('mousedown', function(e) {
                    var pscope = scope.$parent;
                    var pid = ref._id;
                    var selected = pscope.isSelected(pid);
                    if (e.shiftKey) {
                        if (selected) {
                            pscope.unselect(pid);
                        } else {
                            pscope.select(pid);
                        }
                    } else {
                        if (selected) {
                            // do nothing
                        } else {
                            pscope.clearSelection();
                            pscope.select(pid);
                        }
                    }
                });
                el.addEventListener('dragstart', function(e) {
                    var firefox = (e.offsetX === undefined);
                    var offX = firefox ? e.layerX : e.offsetX;
                    var offY = firefox ? e.layerY : e.offsetY;

                    var point = {
                        x: offX,
                        y: offY
                    };

                    scope.$parent.dragpoint = point;


                    var selection = $('#selection');
                    var selImg = selection.get(0);

                    var elmX = element.position().left;
                    var elmY = element.position().top;
                    var xx = elmX + point.x;
                    var yy = elmY + point.y;
                    var safari = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1;
                    if (safari) {
                        e.dataTransfer.setDragImage(selImg, xx, yy);
                    }

                    var models = scope.$parent.getSelectedModels();
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
                    scope.$parent.dragging2 = ref;
                });
                el.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    scope.dragover(e);
                });
                el.addEventListener('drop', function(e) {
                    e.preventDefault();
                    scope.drop(e, e.clientX, e.clientY);
                });

                el.addEventListener('dragend', function() {
                    scope.$parent.dragging2 = 'none';
                });
            }
        };
    });

angular.module('kf6App')
    .directive('KFViewDropCanvas', function() {
        return {
            restrict: 'C',
            link: function(scope, element) {
                scope.canvas = element;
                var el = element[0];
                el.droppable = true;
                el.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    scope.dragover(e);
                });
                el.addEventListener('drop', function(e) {
                    e.preventDefault();
                    scope.drop(e, e.clientX, e.clientY);
                });
            }
        };
    });