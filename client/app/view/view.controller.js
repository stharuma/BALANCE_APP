/* global jsPlumb */

'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams, $community, socket, Auth) {
        var viewId = $stateParams.viewId;
        $scope.view = {};
        $scope.refs = [];
        $scope.dragging = 'none';

        $http.get('/api/views/' + viewId).success(function(view) {
            $scope.view = view;
            $community.enter(view.communityId);
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
                socket.syncUpdates('ref', $scope.refs, function(event, item) {
                    if (event === 'created') {
                        $scope.updateRef(item);
                        $scope.updateLink(item.to);
                    }
                    if (event === 'updated') {
                        $scope.updateRef(item);
                    }
                });
                //authors info
                $scope.refs.forEach(function(ref) {
                    $scope.updateRef(ref);
                });
                $community.updateCommunityMembers();

                //update links
                $scope.updateLinks();

                //read
                $scope.refreshRead();
            });
        };

        $scope.updateRef = function(ref) {
            if (ref.showInPlace === true) {
                $scope.loadAsShowInPlace(ref);
            } else {
                $scope.loadAsIcon(ref);
            }
        };

        $scope.loadAsShowInPlace = function(ref) {
            $http.get('api/contributions/' + ref.to).success(function(contribution) {
                ref.contribution = contribution;
            });
        };

        $scope.loadAsIcon = function(ref) {
            ref.getColor = function() {
                if (ref.read === true) {
                    return '#D80E58';
                }
                return '#0000FF';
            };
            ref.authorObjects = [];
            ref.getAuthorString = function() {
                var authorString = '';
                ref.authorObjects.forEach(function(each) {
                    if (authorString.length !== 0) {
                        authorString += ', ';
                    }
                    authorString += each.name;
                });
                return authorString;
            };
            ref.authorsTo.forEach(function(id) {
                ref.authorObjects.push($community.getMember(id));
            });
        };

        $scope.refreshRead = function() {
            var uid = Auth.getCurrentUser()._id;
            if (uid === null) {
                return;
            }
            $http.get('/api/records/count/' + $scope.view._id + '/' + uid).success(function(res) {
                res.forEach(function(each) {
                    $scope.updateRefRead(each._id);
                });
            });

            socket.socket.emit('subscribe', uid);
            socket.socket.on('record:save', function(record) {
                if (record.type === 'read') {
                    $scope.updateRefRead(record.targetId);
                }
            });
            $scope.$on('$destroy', function() {
                socket.socket.emit('unsubscribe', uid);
                socket.socket.removeAllListeners('record:save');
            });
        };

        $scope.updateRefRead = function(id) {
            var ref = _.find($scope.refs, function(ref) {
                return ref.to === id;
            });
            if (ref) {
                ref.read = true;
            }
        };

        $scope.updateLink = function(id) {
            $http.get('/api/links/tofrom/' + id).success(function(links) {
                links.forEach(function(link) {
                    if (link.type === 'buildson') {
                        $scope.makelink(link.from, link.to);
                    }
                });
            });
        };

        $scope.updateLinks = function() {
            $http.get('/api/links/view/' + $scope.view._id).success(function(links) {
                links.forEach(function(link) {
                    if (link.type === 'buildson') {
                        $scope.makelink(link.from, link.to);
                    }
                });
            });
        };

        $scope.conns = {};

        $scope.makelink = function(from, to) {
            var fromElements = $('.icon' + from);
            var toElements = $('.icon' + to);
            fromElements.each(function() {
                var fromElement = $(this);
                var fromId = fromElement.attr('id');
                toElements.each(function() {
                    var toElement = $(this);
                    var toId = toElement.attr('id');
                    var conn = jsPlumb.connect({
                        source: fromId,
                        target: toId
                    });
                    $scope.registerConn(fromId, conn);
                    $scope.registerConn(toId, conn);
                });
            });
        };

        /* ----------- connections --------- */

        $scope.registerConn = function(id, conn) {
            if ($scope.conns[id] === undefined) {
                $scope.conns[id] = [];
            }
            $scope.conns[id].push(conn);
        };

        $scope.detachAllConnections = function(id) {
            if ($scope.conns[id] === undefined) {
                return;
            }
            $scope.conns[id].forEach(function(conn) {
                if (conn.detached !== true) {
                    jsPlumb.detach(conn);
                    conn.detached = true;
                }
            });
            $scope.conns[id] = [];
        };

        jsPlumb.ready(function() {
            jsPlumb.setContainer($('#maincanvas'));
            jsPlumb.importDefaults({
                Connector: ['Straight'],
                Endpoints: ['Blank', 'Blank'],
                Overlays: [
                    ['Arrow', {
                        width: 7,
                        length: 7,
                        location: 1
                    }]
                ],
                Anchor: ['Perimeter', {
                    shape: 'Rectangle'
                }],
                PaintStyle: {
                    lineWidth: 1,
                    strokeStyle: 'rgba(180,180,180,0.7)'
                }
            });
        });

        /* ----------- creation --------- */

        $scope.createNote = function() {
            $community.createNote(function(note) {
                $scope.createOnViewRef(note._id, 100, 100);
                $scope.openContribution(note._id);
            });
        };

        $scope.createDrawing = function() {
            $community.createDrawing(function(drawing) {
                $scope.createOnViewRef(drawing._id, 100, 100, 100, 100, false, true);
                $scope.openContribution(drawing._id);
            });
        };

        $scope.createOnViewRef = function(contributionId, x, y, w, h, fixed, showInPlace) {
            $http.post('/api/onviewrefs', {
                to: contributionId,
                from: $scope.view._id,
                type: 'onviewref',
                x: x,
                y: y,
                width: w,
                height: h,
                fixed: fixed,
                showInPlace: showInPlace
            });
        };

        $scope.saveRef = function(ref) {
            $http.put('/api/onviewrefs/' + ref._id, ref);
        };

        $scope.openContribution = function(id) {
            var url = './contribution/' + id;
            window.open(url, '_blank');
        };

        $scope.openInWindow = function() {
            $scope.openContribution($scope.contextTarget.to);
        };

        $scope.edit = function() {
            $scope.openInWindow();
        };

        $scope.showAsIcon = function() {
            $scope.contextTarget.showInPlace = false;
            $scope.saveRef($scope.contextTarget);
        };

        $scope.showInPlace = function() {
            $scope.contextTarget.showInPlace = true;
            $scope.saveRef($scope.contextTarget);
        };

        $scope.onContextOpen = function(childScope) {
            $scope.contextTarget = childScope.ref;
        };

        $scope.openSearch = function() {
            var url = '/search/' + $scope.view.communityId;
            window.open(url, '_blank');
        };

        $scope.delete = function() {
            if ($scope.contextTarget === undefined) {
                window.alert('contextTarget is not set.');
                return;
            }
            var ref = $scope.contextTarget;
            $http.delete('/api/onviewrefs/' + ref._id);
        };

    });