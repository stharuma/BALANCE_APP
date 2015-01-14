/* global jsPlumb */

'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams, $community, $compile, $timeout, socket, Auth) {
        var viewId = $stateParams.viewId;
        $scope.view = {};
        $scope.views = $community.getViews();
        $scope.refs = [];
        $scope.conns = {};
        $scope.dragging = 'none';

        $scope.isViewsCollapsed = true;
        $scope.isAttachmentCollapsed = true;

        $http.get('/api/contributions/' + viewId).success(function(view) {
            $scope.view = view;
            $community.enter(view.communityId);
            $community.refreshViews();
            $scope.updateCanvas();
        });

        $scope.updateCanvas = function() {
            $http.get('/api/links/from/' + viewId).success(function(refs) {
                //temporary get rid of others from onviewref
                var onviewrefs = [];
                refs.forEach(function(ref) {
                    if (ref.type === 'onviewref') {
                        onviewrefs.push(ref);
                    }
                });
                $scope.refs = onviewrefs;
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
            if (ref.refreshFixedStatus) {
                ref.refreshFixedStatus();
            }
            if (ref.data.showInPlace === true) {
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
            ref.authorObjects = [];

            ref.getIcon = function() {
                if (ref.typeTo === 'View') {
                    return 'manual_assets/kf4images/icon-view.gif';
                }
                if (ref.typeTo === 'Attachment') {
                    return 'manual_assets/kf4images/icon-attachment.gif';
                }
                if (ref.typeTo === 'Drawing') {
                    return 'manual_assets/kf4images/icon-drawing.gif';
                }

                var author = ref.amIAuthor();
                if (ref.read === true) {
                    if (author === true) {
                        return 'manual_assets/kf4images/icon-note-read-auth-.gif';
                    } else {
                        return 'manual_assets/kf4images/icon-note-read-othr-.gif';
                    }
                } else {
                    if (author === true) {
                        return 'manual_assets/kf4images/icon-note-unread-auth-.gif';
                    } else {
                        return 'manual_assets/kf4images/icon-note-unread-othr-.gif';
                    }
                }
            };

            if (ref.typeTo === 'View') {
                return;
            }

            ref.getAuthorString = function() {
                return $community.makeAuthorString(ref.authorObjects);
            };
            ref.amIAuthor = function() {
                return $community.amIAuthor(ref);
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
            $http.get('/api/links/onview/' + $scope.view._id).success(function(links) {
                links.forEach(function(link) {
                    if (link.type === 'buildson') {
                        $scope.makelink(link.from, link.to);
                    }
                });
            });
        };

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
                $scope.createOnViewRef(note, {
                    x: 100,
                    y: 100
                });
                $scope.openContribution(note._id);
            });
        };

        $scope.createDrawing = function() {
            $community.createDrawing(function(drawing) {
                $scope.createOnViewRef(drawing, {
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                    showInPlace: true
                });
                $scope.openContribution(drawing._id);
            });
        };

        $scope.createViewlink = function() {
            $scope.isViewsCollapsed = !$scope.isViewsCollapsed;
        };

        $scope.createOnViewRefById = function(id, data) {
            $http.get('/api/contributions/' + id).success(function(contribution) {
                $scope.createOnViewRef(contribution, data);
            });
        };

        $scope.createOnViewRef = function(target, data) {
            var refObj = {};
            refObj.from = $scope.view._id;
            refObj.to = target._id;
            refObj.type = 'onviewref';
            refObj.titleTo = target.title;
            refObj.authorsTo = target.authors;
            refObj.typeTo = target.type;
            refObj.data = data;
            $http.post('/api/links', refObj);
        };

        $scope.saveRef = function(ref) {
            $http.put('/api/links/' + ref._id, ref);
        };

        $scope.openAttachment = function() {
            $scope.isAttachmentCollapsed = !$scope.isAttachmentCollapsed;
        };

        $scope.attachmentUpdated = function(attachment) {
            $timeout(function() {
                $scope.isAttachmentCollapsed = true;
            }, 1000);
            $http.post('/api/links', {
                from: $scope.view._id,
                to: attachment._id,
                type: 'onviewref',
                data: {
                    x: 200,
                    y: 200,
                    width: 200,
                    height: 200
                }
            }).success(function() {

            });
        };

        $scope.openSearch = function() {
            var url = '/search/' + $scope.view.communityId;
            window.open(url, '_blank');
        };

        $scope.openViewProperty = function() {
            var url = './contribution/' + viewId;
            window.open(url, '_blank');
        };

        $scope.openWorkspace = function() {
            $community.getRegistration(function(reg) {
                if (reg.workspaces && reg.workspaces.length > 0) {
                    $scope.openWorkspace0(reg.workspaces[0]);
                } else {
                    $scope.createWorkspace(reg, function(workspace) {
                        $scope.openWorkspace0(workspace._id);
                    });
                }
            });
            //
            //window.alert('not implemented yet.');
        };

        $scope.createWorkspace = function(reg, handler) {
            var title = Auth.getCurrentUser().name + '\'s workspace';
            $community.createView(title, function(view) {
                if (!reg.workspaces) {
                    reg.workspaces = [];
                }
                reg.workspaces.push(view._id);
                $community.saveRegistration(reg, function() {
                    if (handler) {
                        handler(view);
                    }
                });
            });
        };

        $scope.openWorkspace0 = function(viewId) {
            var url = './view/' + viewId;
            $scope.openInPopup(url);
        };

        /* ----------- open window --------- */

        $scope.openContribution = function(id) {
            var url = './contribution/' + id;
            $scope.openByInternalWindow(url);
        };

        $scope.openView = function(id) {
            var url = './view/' + id;
            window.location = url;
        };

        $scope.mOpenContribution = function() {
            $scope.openContribution($scope.contextTarget.to);
        };

        $scope.mOpenContributionInTab = function() {
            var url = './contribution/' + $scope.contextTarget.to;
            window.open(url, '_blank');
        };

        $scope.mOpenContributionInPopup = function() {
            var url = './contribution/' + $scope.contextTarget.to;
            $scope.openInPopup(url);
        };

        $scope.mOpenView = function() {
            $scope.openView($scope.contextTarget.to);
        };

        $scope.mOpenViewInInternal = function() {
            var url = './view/' + $scope.contextTarget.to;
            $scope.openByInternalWindow(url);
        };

        $scope.mOpenViewInPopup = function() {
            var url = './view/' + $scope.contextTarget.to;
            $scope.openInPopup(url);
        };

        $scope.openInPopup = function(url) {
            var width = screen.width * 0.5;
            var height = screen.height * 0.8;
            var w = window.open(url, 'view', 'width=' + width + ',height=' + height);
            w.moveTo(100, 100);
        };

        var windowIdNum = 1;

        $scope.openByInternalWindow = function(url) {
            var width = 600;
            var height = 400;
            var wmax = window.innerWidth * 0.8;
            if (width > wmax) {
                width = wmax;
            }
            var hmax = window.innerHeight * 0.8;
            if (height > hmax) {
                height = hmax;
            }
            $scope.openByIFrame(url, width, height);
            //$scope.openInternally(url, width, height);
        };

        // now investigating
        // $scope.openInternally = function(url, width, height) {
        //     windowIdNum++;
        //     var wid = 'window' + windowIdNum;
        //     var str = '<div id="' + wid + '">CONTENT</div>';
        //     var content = '<ng-include src="\'app/contribution/contribution.html\'" ng-controller="ContributionCtrl"></ng-include>';
        //     str = str.replace('CONTENT', content);
        //     $('#windows').append(str);
        //     $('#' + wid).css('position', 'absolute');
        //     $('#' + wid).css('width', '200px');
        //     $('#' + wid).css('height', '200px');
        //     $('#' + wid).css('border', '1px solid black');
        //     $('#' + wid).css('pointer-events', 'auto');
        //     $compile($('#' + wid).contents());
        //     $('#' + wid).resizable();
        // }

        $scope.openByIFrame = function(url, width, height) {
            windowIdNum++;
            var wid = 'window' + windowIdNum;
            var str = '<iframe style="min-width: 100%;" id="' + wid + '" title="Contribution" src="' + url + '"></iframe>';
            $('#windows').append(str);
            $('#' + wid).dialog({
                width: width,
                height: height,
                create: function() {
                    $(this).css('padding-left', '1px');
                    $(this).css('padding-top', '1px');
                    $(this).css('padding-bottom', '2px');
                    $(this).css('padding-right', '2px');
                },
                close: function() { /*we need to erase element*/
                    $(this).remove();
                }
            });
        };

        /* ----------- context menu --------- */

        $scope.onContextOpen = function(childScope) {
            $scope.contextTarget = childScope.ref;
        };

        $scope.showAsIcon = function() {
            $scope.contextTarget.data.showInPlace = false;
            $scope.saveRef($scope.contextTarget);
        };

        $scope.showInPlace = function() {
            $scope.contextTarget.data.showInPlace = true;
            $scope.saveRef($scope.contextTarget);
        };

        $scope.fix = function() {
            if ($scope.contextTarget) {
                var ref = $scope.contextTarget;
                ref.data.fixed = true;
                $scope.saveRef(ref);
            }
        };

        $scope.unfix = function() {
            if ($scope.contextTarget) {
                var ref = $scope.contextTarget;
                ref.data.fixed = false;
                $scope.saveRef(ref);
            }
        };

        $scope.delete = function() {
            if ($scope.contextTarget === undefined) {
                window.alert('contextTarget is not set.');
                return;
            }
            var ref = $scope.contextTarget;
            $http.delete('/api/links/' + ref._id);
        };

    });