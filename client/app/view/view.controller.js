'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams, $member, socket, Auth) {
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
                socket.syncUpdates('ref', $scope.refs, function(event, item) {
                    if (event === 'created') {
                        $scope.addRef(item);
                    }
                    if (event === 'updated') {
                        $scope.addRef(item);
                    }
                });
                //authors info
                $scope.refs.forEach(function(ref) {
                    $scope.addRef(ref);
                });
                $member.updateCommunityMembers();

                //update links
                $scope.updateLinks();

                //read
                $scope.refreshRead();
            });
        };

        $scope.addRef = function(ref) {
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
            ref.authors.forEach(function(id) {
                ref.authorObjects.push($member.getMember(id));
            });
        };

        $scope.refreshRead = function() {
            var uid = Auth.getCurrentUser()._id;
            if (uid === null) {
                return;
            }
            $http.get('/api/records/count/' + $scope.view._id + '/' + uid).success(function(res) {
                console.log(res);
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

        $scope.updateLinks = function() {
            $http.get('/api/links/view/' + $scope.view._id).success(function(links) {
                links.forEach(function(link) {
                    if (link.type === 'buildson') {
                        $scope.makelink(link.from, link.to);
                    } else {
                        //console.log('not a buildson');
                    }
                });
            });
        }

        $scope.makelink = function(from, to) {
            var fromElements = $('.icon' + from);
            var toElements = $('.icon' + to);
            fromElements.each(function() {
                var fromElement = $(this);
                var fromId = fromElement.attr('id');
                toElements.each(function() {
                    var toElement = $(this);
                    var toId = toElement.attr('id');
                    jsPlumb.connect({
                        source: fromId,
                        target: toId,
                    });
                });
            });
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
                to: contribution._id,
                from: $scope.view._id,
                type: 'onviewref',
                x: x,
                y: y,
                title: contribution.title,
                authors: contribution.authors
            });
        };

        $scope.updateRef = function(ref) {
            $http.put('/api/onviewrefs/' + ref._id, ref);
        };

        $scope.openContribution = function(ref) {
            var url = './contribution/' + ref.to;
            window.open(url, '_blank');
        };

        $scope.contextOpen = function(childScope) {
            $scope.contextTarget = childScope.ref;
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