/* global jsPlumb */
/* jshint unused: false */

'use strict';

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $http, $stateParams, $community, $compile, $timeout, socket, Auth, $location) {
        var viewId = $stateParams.viewId;
        $scope.menuStatus = $stateParams.menuStatus;
        if ($scope.menuStatus) {
            $('#maincanvas').addClass('KFViewMainCanvasWithoutMenu');
        }
        $scope.view = {};
        $scope.views = $community.getViews();
        $scope.refs = [];

        $scope.status = {};
        $scope.status.isViewlinkCollapsed = true;
        $scope.status.isViewManagerCollapsed = true;
        $scope.status.isAttachmentCollapsed = true;
        $scope.status.isSettingCollapsed = true;
        $scope.setting = {
            buildson: true,
            references: true
        };
        $scope.dragging = 'none';

        $scope.initialize = function() {
            $http.get('/api/contributions/' + viewId).success(function(view) {
                $scope.view = view;
                $community.enter(view.communityId);
                $community.refreshViews();
                $scope.updateCanvas();
            });
        };

        $scope.updateCanvas = function() {
            $http.get('/api/links/from/' + viewId).success(function(refs) {
                //temporary get rid of others from contains
                var onviewrefs = [];
                refs.forEach(function(ref) {
                    if (ref.type === 'contains') {
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
                var refscopy = _.clone($scope.refs);
                refscopy.forEach(function(ref) {
                    $scope.updateRef(ref);
                });
                $community.updateCommunityMembers();

                //update links
                $scope.updateLinks();

                //read
                $scope.refreshRead();
            });
        };

        $scope.settingChanged = function() {
            $scope.updateLinks();
        };

        $scope.updateRef = function(ref) {

            // assure data
            if (!ref._to) {
                console.log('ref._to not found');
                ref._to = {};
            }
            if (!ref.data) {
                ref.data = {};
            }

            // show only active
            if (ref._to.status !== 'active') {
                _.remove($scope.refs, function(obj) {
                    return obj === ref;
                });
                return;
            }

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
                if (ref._to.type === 'View') {
                    return 'manual_assets/kf4images/icon-view.gif';
                }
                if (ref._to.type === 'Attachment') {
                    return 'manual_assets/kf4images/icon-attachment.gif';
                }
                if (ref._to.type === 'Drawing') {
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

            if (ref._to.type === 'View') {
                return;
            }

            ref.getAuthorString = function() {
                return $community.makeAuthorString(ref.authorObjects);
            };
            ref.amIAuthor = function() {
                return $community.amIAuthor(ref);
            };
            if (ref._to.authors) {
                ref._to.authors.forEach(function(id) {
                    ref.authorObjects.push($community.getMember(id));
                });
            }
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
                    $scope.createConnection(link);
                });
            });
        };

        $scope.updateLinks = function() {
            $scope.clearAllConnections();
            $http.get('/api/links/onview/' + $scope.view._id).success(function(links) {
                links.forEach(function(link) {
                    $scope.createConnection(link);
                });
            });
        };

        /* ----------- connections --------- */

        $scope.connectionIdCounter = 0;
        $scope.jsPlumb = undefined;
        $scope.repaintRequest = false;
        $scope.$watch('repaintRequest', function() {
            if ($scope.repaintRequest === false) {
                return;
            }
            if ($scope.jsPlumb) {
                try {
                    $scope.jsPlumb.repaintEverything();
                } catch (e) {
                    console.log(e);
                }
            }
            $scope.repaintRequest = false;
        });

        $scope.generateConnectionId = function() {
            $scope.connectionIdCounter++;
            return 'kfconnection' + $scope.connectionIdCounter;
        };

        $scope.repaintConnections = function(ref) {
            $scope.repaintRequest = true;
        };

        $scope.createConnection = function(link) {
            if (link.type === 'buildson' && $scope.setting.buildson) {
                $scope.createConnection0(link, 'blue', '');
            }
            if (link.type === 'references' && $scope.setting.references) {
                var text = '';
                if (link.data && link.data.text && link.data.text.length > 0) {
                    text = link.data.text;
                    if (text.length > 24) {
                        text = text.substring(0, 24) + '...';
                    }
                    text = '"' + text + '"';
                }
                $scope.createConnection0(link, 'black', text);
            }
        };

        $scope.createConnection0 = function(link, color, label) {
            var fromElements = $('.icon' + link.from);
            var toElements = $('.icon' + link.to);
            fromElements.each(function() {
                var fromElement = $(this);
                toElements.each(function() {
                    var toElement = $(this);
                    $scope.createConnection1(fromElement, toElement, color, label);
                });
            });
        };

        $scope.createConnection1 = function(fromElement, toElement, color, label) {
            var fromId = $scope.generateConnectionId();
            fromElement.attr('id', fromId);
            var toId = $scope.generateConnectionId();
            toElement.attr('id', toId);
            var conn = $scope.jsPlumb.connect({
                source: fromId,
                target: toId,
                type: 'kfarrow',
                data: {
                    color: color,
                    label: label
                }
            });
            if (conn) {
                $('#' + fromId).on("$destroy", function() {
                    if (conn.detached !== true) {
                        $scope.jsPlumb.detach(conn);
                        conn.detached = true;
                    }
                });
                $('#' + toId).on("$destroy", function() {
                    if (conn.detached !== true) {
                        $scope.jsPlumb.detach(conn);
                        conn.detached = true;
                    }
                });
            }
        };

        $scope.clearAllConnections = function() {
            $scope.jsPlumb.detachEveryConnection();
        };

        jsPlumb.ready(function() {
            $scope.jsPlumb = jsPlumb.getInstance();
            $scope.jsPlumb.setContainer($('#maincanvas'));
            $scope.jsPlumb.importDefaults({
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
            $scope.jsPlumb.registerConnectionTypes({
                'kfarrow': {
                    overlays: [
                        ['Arrow', {
                            width: 7,
                            length: 7,
                            location: 1
                        }],
                        ['Label', {
                            label: '${label}'
                        }]
                    ],
                    paintStyle: {
                        strokeStyle: '${color}',
                        lineWidth: 1
                    }
                },
            });
            $scope.initialize();
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
            $scope.status.isViewlinkCollapsed = !$scope.status.isViewlinkCollapsed;
        };

        $scope.createOnViewRefById = function(id, data) {
            $http.get('/api/contributions/' + id).success(function(contribution) {
                $scope.createOnViewRef(contribution, data);
            });
        };

        $scope.createOnViewRef = function(target, data, handler) {
            $scope.createOnViewRef0($scope.view, target._id, target, data, handler);
        };

        $scope.createOnViewRef0 = function(view, targetId, target, data, handler) {
            var refObj = {};
            refObj.from = view._id;
            refObj.to = targetId;
            refObj.type = 'contains';
            refObj.data = data;
            $http.post('/api/links', refObj).success(function() {
                if (handler) {
                    handler();
                }
            });
        };

        $scope.saveRef = function(ref) {
            $http.put('/api/links/' + ref._id, ref);
        };

        $scope.openAttachment = function() {
            $scope.status.isAttachmentCollapsed = !$scope.status.isAttachmentCollapsed;
        };

        $scope.attachmentUpdated = function(attachment) {
            $timeout(function() {
                $scope.status.isAttachmentCollapsed = true;
                $scope.$digest($scope.status.isAttachmentCollapsed);
            }, 1500);
            $http.post('/api/links', {
                from: $scope.view._id,
                to: attachment._id,
                type: 'contains',
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

        // $scope.openViewProperty = function() {
        //     var url = './contribution/' + viewId;
        //     window.open(url, '_blank');
        // };

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
        };

        $scope.openScaffolds = function() {
            var url = '/scaffoldmanager/' + $scope.view.communityId;
            window.open(url, '_blank');
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
            }, true);
        };

        $scope.openWorkspace0 = function(viewId) {
            var url = './view/' + viewId;
            $scope.openInPopup(url);
        };

        $scope.doExit = function() {
            var url = '';
            $scope.gotoURL(url);
        };

        /* ----------- open window --------- */

        $scope.openContribution = function(id) {
            var url = 'contribution/' + id;
            $scope.openByInternalWindow(url);
        };

        $scope.openView = function(id) {
            var url = 'view/' + id;
            $scope.gotoURL(url);
        };

        $scope.mOpenContribution = function() {
            $scope.openContribution($scope.contextTarget.to);
        };

        $scope.mOpenContributionInTab = function() {
            var url = 'contribution/' + $scope.contextTarget.to;
            window.open(url, '_blank');
        };

        $scope.mOpenContributionInPopup = function() {
            var url = 'contribution/' + $scope.contextTarget.to;
            $scope.openInPopup(url);
        };

        $scope.mOpenView = function() {
            $scope.openView($scope.contextTarget.to);
        };

        $scope.mOpenViewInInternal = function() {
            var url = 'view/' + $scope.contextTarget.to;
            $scope.openByInternalWindow(url);
        };

        $scope.mOpenViewInPopup = function() {
            var url = 'view/' + $scope.contextTarget.to;
            $scope.openInPopup(url);
        };

        $scope.gotoURL = function(url) {
            $location.path(url);
        };

        $scope.openInPopup = function(url) {
            var width = screen.width * 0.5;
            var height = screen.height * 0.8;
            var w = window.open(url, '_blank', 'width=' + width + ',height=' + height);
            if (w) {
                w.moveTo(100, 100);
            } else {
                window.alert('Failed to open popup on your browser. (You may open the second time on safari.)');
            }
        };

        var windowIdNum = 1;

        $scope.openByInternalWindow = function(url) {
            var width = 650;
            var height = 410;
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
            var str = '<iframe style="min-width: 100%;" id="' + wid + '" title="*" src="' + url + '"></iframe>';
            $('#windows').append(str);
            $('#' + wid).dialog({
                width: width,
                height: height,
                create: function() {
                    $(this).css('padding', '1px');
                    var contentWindow = document.getElementById(wid).contentWindow;
                    contentWindow.wid = wid;
                    contentWindow.setInternalWindowTitle = function(title) {
                        $('#' + wid).dialog('option', 'title', title);
                    };
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

        $scope.delete = function(ref) {
            var selected = $scope.getSelectedModels();
            var confirmation = window.confirm('Are you sure to delete ' + selected.length + ' links?');
            if (!confirmation) {
                return;
            }
            selected.forEach(function(each) {
                $http.delete('/api/links/' + each._id);
            });
        };

        $scope.createRiseabove = function() {
            var selected = $scope.getSelectedModels();
            var confirmation = window.confirm('Are you sure to create riseabove using ' + selected.length + ' objects?');
            if (!confirmation) {
                return;
            }
            var topleft = {
                x: 10000,
                y: 10000
            };
            selected.forEach(function(ref) {
                topleft.x = Math.min(topleft.x, ref.data.x);
                topleft.y = Math.min(topleft.y, ref.data.y);
            });
            $community.createView('riseabove:', function(view) {
                $community.createNote(function(note) {
                    note.title = 'Riseabove';
                    $community.makeRiseabove(note, view._id, function(note) {
                        selected.forEach(function(each) {
                            $scope.createOnViewRef0(view, each.to, null, {
                                x: each.data.x - topleft.x + 20,
                                y: each.data.y - topleft.y + 20
                            });
                        });
                        selected.forEach(function(each) {
                            $http.delete('/api/links/' + each._id);
                        });
                        //timing? need investigation
                        $scope.createOnViewRef(note, {
                            x: topleft.x + 50,
                            y: topleft.y + 50
                        }, function() {});
                    });
                });
            }, true);
        };

    });

function closeDialog(wid) {
    $('#' + wid).dialog('close');
}