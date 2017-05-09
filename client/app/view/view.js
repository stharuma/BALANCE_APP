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
                el.addEventListener('dragstart', function(e) {
                    $scope.draggingViewlink = scope.view;
                    e.dataTransfer.setData('Text', el.id);
                });
                el.addEventListener('dragend', function() {
                    $scope.draggingViewlink = null;
                });
            }
        };
    });

angular.module('kf6App')
    .directive('kfViewRef', function($kfutil) {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var ref = scope.ref;
                var $scope = scope.$parent;
                var el = element[0];

                scope.$watch('ref.data.x', function() {
                    $scope.repaintConnections(ref);
                });
                scope.$watch('ref.data.y', function() {
                    $scope.repaintConnections(ref);
                });

                ref.refreshFixedStatus = function() {
                    if (ref.data.fixed === true) {
                        element.css('z-index', -1);
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

                /** touch support **/
                var timer;
                var sp;
                var state = 'IDLE';
                var contextOpened = false;
                var proxy;
                el.addEventListener('touchstart', function(e) {
                    if (!$scope.isSelected(ref._id)) {
                        $scope.singleSelect(ref._id);
                    }
                    sp = $kfutil.getTouchPos(e);
                    state = 'PRESSED';
                    if ($kfutil.isiOS()) {
                        timer = setTimeout(function() {
                            if (state === 'PRESSED') {
                                state = 'CONTEXTMENUOPENED';
                                showHelo(e);
                            }
                        }, 700);
                    }
                });
                el.addEventListener('touchmove', function(e) {
                    clearTimeout(timer);
                    if (state === 'MOVING') {
                        var d = calcDelta(e);
                        $('#kf6-touch-proxy').css({
                            left: ref.data.x + d.x,
                            top: ref.data.y + d.y
                        });
                    }
                    if (state === 'PRESSED') {
                        state = 'MOVING';
                        //Add proxy image here.
                        proxy = el.cloneNode(true);
                        proxy.id = 'kf6-touch-proxy';
                        $('#maincanvas').get(0).appendChild(proxy);
                        $('#kf6-touch-proxy').css({
                            opacity: '0.5'
                        });
                    }
                    e.preventDefault();
                });
                el.addEventListener('touchend', function(e) {
                    handleEnd(e);
                });
                el.addEventListener('touchcancel', function(e) {
                    handleEnd(e);
                });

                function handleEnd(e) {
                    clearTimeout(timer);
                    if (state === 'MOVING') {
                        e.preventDefault();
                        if (proxy) {
                            $('#maincanvas').get(0).removeChild(proxy);
                            proxy = null;
                        }
                        var delta = calcDelta(e);
                        $scope.moveRefs(delta);
                        return;
                    }
                    if (state === 'CONTEXTMENUOPENED') {
                        e.preventDefault();
                        e.stopPropagation();
                        contextOpened = true;
                    }
                    state = 'IDLE';
                    return;
                }
                el.addEventListener('click', function(e) {
                    if (contextOpened === true) {
                        //e.preventDefault();
                        e.stopPropagation();
                        contextOpened = false;
                    }
                });

                function calcDelta(e) {
                    var p = $kfutil.getTouchPos(e);
                    var delta = {
                        x: p.x - sp.x,
                        y: p.y - sp.y
                    };
                    return delta;
                }

                function showHelo(e) {
                    $kfutil.fireContextMenuEvent(e, element);
                }

                /** touch support end **/

                el.addEventListener('dragstart', function(e) {
                    var offset = $kfutil.getOffset(e);
                    if ($kfutil.isSafari() /*|| (chrome && $scope.selected.length >= 2)*/ ) {
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
                        hrefs += '<a href="contribution/' + each.to + '">';
                        hrefs += each._to.title;
                        hrefs += '</a><br>';
                    });
                    if (!$kfutil.isIE()) {
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
    .directive('kfViewMarqueeCanvas', function($kfutil) {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var $scope = scope;
                element.bind('contextmenu', function(e) {
                    if (!$scope.isEditable || !$scope.isEditable()) {
                        return;
                    }
                    var found = findObject(e);
                    if (!found) {
                        return; //not found
                    }

                    e.preventDefault();
                    //e.stopPropagation();
                    e.stopImmediatePropagation();
                    //found
                    var model = $scope.searchById($scope.refs, found.id);
                    if (!model) {
                        window.alert('model not found for ' + found.id);
                        return;
                    }
                    if (!$scope.isUnlockable(model)) {
                        window.alert('You cannot edit this object on your privilege.');
                        return;
                    }
                    var confirmation = window.confirm('here is a locked object, would you like to unlock?');
                    if (!confirmation) {
                        return;
                    }

                    $scope.unlock(model);
                });

                function findObject(e) {
                    var mousePos = $kfutil.getOffset(e);
                    var result = null;
                    $('#viewcanvas').children().each(function(index, child) {
                        if (contains(child, mousePos)) {
                            result = child;
                        }
                    });
                    return result;
                }

                function contains(element, p) {
                    //var r = element.getBoundingClientRect();//this does not work
                    var r = {
                        left: element.offsetLeft,
                        right: element.offsetLeft + element.offsetWidth,
                        top: element.offsetTop,
                        bottom: element.offsetTop + element.offsetHeight
                    };
                    return (r.left <= p.x && p.x <= r.right && r.top <= p.y && p.y <= r.bottom);
                }

                /*********   for touch interface ************/

                var el = element[0];
                var timer;
                el.addEventListener('touchstart', function(e) {
                    timer = setTimeout(function() {
                        openContextMenu(e);
                    }, 700);
                });
                el.addEventListener('touchmove', function() {
                    clearTimeout(timer);
                });
                el.addEventListener('touchend', function() {
                    clearTimeout(timer);
                });
                el.addEventListener('touchcancel', function() {
                    clearTimeout(timer);
                });

                function openContextMenu(e) {
                    $kfutil.fireContextMenuEvent(e, element);
                }

                /*********   for touch interface end ************/
            }
        };
    });


angular.module('kf6App')
    .directive('kfViewDropCanvas', function() {
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

                $scope.singleSelect = function(id) {
                    $scope.clearSelection();
                    $scope.select(id);
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
                    $scope.remove($scope.selected, id);
                    var target = $('#' + id);
                    $('#viewcanvas').append(target);
                    target.resizable('destroy');
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
    .directive('kfViewDropCanvas', function($suresh, $community) {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var $scope = scope;

                $scope.dragover = function(e) {
                    if (!$scope.isEditable || !$scope.isEditable()) {
                        e.dataTransfer.dropEffect = 'none';
                        return;
                    }

                    if ($scope.dragging !== 'none') {
                        e.dataTransfer.dropEffect = 'move';
                    } else {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                };

                $scope.drop = function(e, ref) {
                    if (!$scope.isEditable || !$scope.isEditable()) {
                        return;
                    }

                    var firefox = (e.offsetX === undefined);
                    var newX = firefox ? e.layerX : e.offsetX;
                    var newY = firefox ? e.layerY : e.offsetY;
                    if (ref) {
                        newX = newX + ref.data.x;
                        newY = newY + ref.data.y;
                    }

                    if ($scope.dragging !== 'none') { //Internal DnD
                        var postref = $scope.dragging;
                        if(postref.data.draggable !== undefined && !postref.data.draggable) {
                            return;
                        }
                        var dx = newX - postref.data.x - $scope.dragpoint.x;
                        var dy = newY - postref.data.y - $scope.dragpoint.y;
                        $scope.moveRefs({
                            x: dx,
                            y: dy
                        });

                    } else if ($scope.draggingViewlink) {
                        var view = $scope.draggingViewlink;
                        $scope.createContainsLink(view._id, {
                            x: newX,
                            y: newY
                        });
                    } else { //External DnD
                        var data = e.dataTransfer.getData('text');
                        var index = data.indexOf('objectIds:');
                        var text = '';
                        if (index === 0) {
                            text = data.replace('objectIds:', '');
                            var ids = JSON.parse(text);
                            ids.forEach(function(each) {
                                $scope.createContainsLink(each, {
                                    x: newX,
                                    y: newY
                                });
                            });
                            return;
                        }
                        index = data.indexOf('pidata');
                        if (index !== -1) {
                            var d= data.split('§§§');
                            var body = d[0];
                            $suresh.setCordinate(newX,newY);
                            var viewIds =[];
                            viewIds.push(scope.view);
                            $suresh.createnewnoteInMutipleView('Promising', viewIds, $community, body, true);
                        }

                        index = data.indexOf('postref:');
                        if (index !== 0) {
                            return;
                        }
                        text = data.replace('postref:', '');
                        var models = JSON.parse(text);
                        models.forEach(function(each) {
                            var dt = {};
                            dt.x = newX + each.offsetX;
                            dt.y = newY + each.offsetY;
                            if(each.data){
                                if(each.data.width){
                                    dt.width = each.data.width;
                                }
                                if(each.data.height){
                                    dt.height = each.data.height;
                                }
                                if(each.data.showInPlace){
                                    dt.showInPlace = each.data.showInPlace;
                                }
                            }
                            $scope.createContainsLink(each.to, dt);
                        });
                    }
                    $scope.draggingViewlink = null;
                };

                $scope.moveRefs = function(delta) {
                    $scope.getSelectedModels().forEach(function(ref) {
                        ref.data.x += delta.x;
                        ref.data.y += delta.y;
                        $scope.saveRef(ref);
                    });
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
    .directive('kfViewMarqueeCanvas', function() {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var marquee = null;
                var pressX;
                var pressY;

                element.on('mousedown', function(e) {
                    if(e.which === 1){
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
                    }
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
                    $('.kfViewRef').each(function() {
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
