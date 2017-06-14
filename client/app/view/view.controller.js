/* global jsPlumb */
/* jshint unused: false */

'use strict';

function onSvgDrawingInitialized() {
            var wnd = document.getElementById('svg-drawing').contentWindow;
            var doc = wnd.document;
            var mainButton = doc.getElementById('main_button');
            mainButton.style.display = 'none';
            var img = new Image();
            var imgSrc = $('#drawingEditor input[name="targetImage"]').val();

            $(img).load(function () {
                var h = img.height;
                var w = img.width;
                if(w > 300){
                    w = 300;
                    h = (300/img.width) * h;
                }
                var svg = '<svg width="'+w+'" height="'+h+'" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1</title><image xlink:href="'+imgSrc+'" id="svg_1" height="'+h+'" width="'+w+'" y="0" x="0"/></g><g><title>Layer 2</title></g></svg>';
                wnd.svgCanvas.setSvgString(svg);
            }).error(function () {
                // image couldnt be loaded
                console.log('An error occurred and your image could not be loaded.  Please try again.');
            }).attr({ src: imgSrc });
            wnd.svgEditor.showSaveWarning = false;
}

angular.module('kf6App')
    .controller('ViewCtrl', function($scope, $rootScope, $http, $stateParams, $community, $compile, $timeout, socket, Auth, $location, $kfutil, $ac, $modal) {
        var viewId = $stateParams.viewId;
        $scope.menuStatus = $stateParams.menuStatus;
        if ($scope.menuStatus) {
            $('#maincanvas').addClass('KFViewMainCanvas0');
        }

        $kfutil.mixIn($scope);
        $scope.community = {};
        $scope.view = {};
        $scope.views = [];
        $scope.refs = [];

        $scope.status = {};
        $scope.status.error = false;
        $scope.status.isViewlinkCollapsed = true;
        $scope.status.isViewManagerCollapsed = true;
        $scope.status.isAttachmentCollapsed = true;
        $scope.status.isAnalyticsCollapsed = true;
        $scope.status.isSettingCollapsed = true;
        $scope.status.isHelpCollapsed = true;
        $scope.setting = $community.makeDefaultViewSetting();
        $scope.dragging = 'none';
        $scope.isDeletable = true;

        $scope.initialize = function() {
            $community.getObject(viewId, function(view) {
                $scope.view = view;
                $ac.mixIn($scope, view);
                $community.enter(view.communityId, function() {
                    $community.refreshGroups();
                    $community.refreshScaffolds(function(){
                    });
                    $scope.community = $community.getCommunityData();
                    $scope.views = $community.getViews();
                    $scope.updateCanvas();
                    $scope.updateViewSetting();
                });
            }, function(msg, status) {
                $scope.status.error = true;
                $scope.status.errorMessage = msg;
            });
        };

        $scope.updateViewSetting = function() {
            //this is temporary code. coherent plan for context management would be expected.(Yoshiaki)
            $community.getContext(null, function(context) {
                $scope.context = context;
            });
            //temporary code end

            if ($scope.view.data && $scope.view.data.viewSetting) {
                $scope.setting = $scope.view.data.viewSetting;
            } else {
                $community.getContext(viewId, function(context) {
                    if (context.data.viewSetting) {
                        $scope.setting = context.data.viewSetting;
                    }
                });
            }
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
                socket.socket.emit('subscribe', 'linkfrom:' + viewId);
                $scope.$on('$destroy', function() {
                    socket.unsyncUpdates('link');
                    socket.socket.emit('unsubscribe', 'linkfrom:' + viewId);
                });
                socket.syncUpdates('link', function(item) {
                    return item.type === 'contains';
                }, $scope.refs, function(event, item) {
                    if (event === 'created') {
                        $scope.updateRef(item);
                        $scope.refreshConnection(item.to);
                        $scope.refreshReadStatus(item);
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
                $community.refreshMembers();

                //update links
                $scope.refreshAllConnections();

                //read
                $scope.refreshAllReadStatus();
            });
        };

        $scope.settingChanged = function() {
            $scope.refreshAllConnections();
        };

        $scope.updateRef = function(ref) {

            // show only contains
            if (ref.type !== 'contains') {
                console.warn('item is not \'contains\'');
                return;
            }

            // assure data
            if (!ref._to) {
                console.warn('ref._to not found');
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

            // show only readable
            if (!$ac.isReadable(ref._to)) {
                _.remove($scope.refs, function(obj) {
                    return obj === ref;
                });
                return;
            }

            // adjust location
            if (ref.data) {
                if (ref.data.x < 2) {
                    ref.data.x = 2;
                }
                if (ref.data.y < 2) {
                    ref.data.y = 2;
                }
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
            $community.getObject(ref.to, function(contribution) {
                ref.contribution = contribution;
            });
        };

        $scope.loadAsIcon = function(ref) {
            ref.authorObjects = [];

            ref.getIcon = function() {
                var iconroot = 'manual_assets/kf4images/';
                return iconroot + ref.getIconFile();
            };

            ref.isRiseabove = function() {
                return ref._to.data && ref._to.data.riseabove;
            };

            ref.isPromisingContains = function() {
                return ref._to.data && ref._to.data.promisingContains;
            };

            ref.getIconFile = function() {
                if (ref._to.type === 'View') {
                    return 'icon-view.gif';
                }
                if (ref._to.type === 'Attachment') {
                    return 'icon-attachment.gif';
                }
                if (ref._to.type === 'Drawing') {
                    return 'icon-drawing.gif';
                }
                if (ref._to.type === 'Note') {
                    var name = 'icon-note-';
                    if (ref.readlink) {
                        if (ref._to.modified < ref.readlink.modified) {
                            name += 'read-';
                        } else {
                            name += 'mod-';
                        }
                    } else {
                        name += 'unread-';
                    }
                    if (ref.amIAuthor()) {
                        name += 'auth-';
                    } else {
                        name += 'othr-';
                    }
                    if (ref.isRiseabove()) {
                        name += 'rise';
                    }
                     if (ref.isPromisingContains()) {
                       name += 'promising';
                    }
                    name += '.gif';
                    return name;
                }
            };

            if (ref._to.type === 'View') {
                return;
            }

            ref.getGroupString = function() {
                if (ref._to.group && $scope.community.groups[ref._to.group]) {
                    var group = $scope.community.groups[ref._to.group];
                    if (group) {
                        return group.title + ': ';
                    }
                }
                return '';
            };

            ref.getAuthorString = function() {
                if ($scope.setting.showGroup && ref.getGroupString().length > 0) {
                    return '';
                }
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

        $scope.refreshReadStatus = function(ref) {
            $http.get('/api/records/myreadstatus/' + $scope.view.communityId + '/' + ref.to).success(function(readlink) {
                ref.readlink = readlink;
            });
        };

        $scope.refreshAllReadStatus = function() {
            var authorId = $scope.community.author._id;
            if (authorId === null) {
                return;
            }
            $http.get('/api/records/myreadstatusview/' + $scope.view.communityId + '/' + $scope.view._id).success(function(readlinks) {
                readlinks.forEach(function(readlink) {
                    $scope.updateRefRead(readlink);
                });
            });

            socket.socket.emit('subscribe', 'linkfrom:' + authorId);
            socket.socket.on('link:save', function(link) {
                if (link.type === 'read') {
                    $scope.updateRefRead(link);
                }
            });
            $scope.$on('$destroy', function() {
                socket.socket.emit('unsubscribe', 'linkfrom:' + authorId);
                socket.socket.removeAllListeners('link:save');
            });
        };

        $scope.updateRefRead = function(readlink) {
            var refs = _.filter($scope.refs, function(ref) {
                return ref.to === readlink.to;
            });
            refs.forEach(function(ref) {
                ref.readlink = readlink;
            });
        };

        $scope.refreshConnection = function(id) {
            $http.get('/api/links/either/' + id).success(function(links) {
                links.forEach(function(link) {
                    $scope.createConnection(link);
                });
            });
        };

        $scope.refreshAllConnections = function() {
            $scope.clearAllConnections();
            $http.get('/api/links/view/' + $scope.view._id).success(function(links) {
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
                    console.error(e);
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
                // TODO: negotiate if and how reference links should be display by default, because views can become quickly loaded.

                //if (link.data && link.data.text && link.data.text.length > 0) {
                //    text = link.data.text;
                //    if (text.length > 24) {
                //        text = text.substring(0, 24) + '...';
                //    }
                //    text = '"' + text + '"';
                //}
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
              type: "kfarrow",
              data: {
                color: color,
                label: label
              }
            });
            if (conn) {
                $('#' + fromId).on('$destroy', function() {
                    if (conn.detached !== true) {
                        try {
                            $scope.jsPlumb.detach(conn);
                        } catch (e) {
                            console.error(e);
                        }
                        conn.detached = true;
                    }
                });
                $('#' + toId).on('$destroy', function() {
                    if (conn.detached !== true) {
                        try {
                            $scope.jsPlumb.detach(conn);
                        } catch (e) {
                            console.error(e);
                        }
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
            Connector: "Straight",
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
              strokeWidth: 1,
              stroke: 'rgba(180,180,180,0.7)'
            }
          });

          $scope.jsPlumb.registerConnectionTypes({
            "kfarrow": {
              connector: "Straight",
              endpoint: "Blank",
              overlays: [
                ['Arrow', {
                  width: 7,
                  length: 7,
                  location: 1
                }],
                ['Label', {
                  label: '${label}'
                }]],
              anchor: ['Perimeter', {
                shape: 'Rectangle'
              }],
              paintStyle: {
                stroke: "${color}",
                strokeWidth: 1
              }
            }
          });
            $scope.initialize();
        });

        /* ----------- creation --------- */

        $scope.createNote = function() {
            if (!$scope.isEditable()) {
                window.alert('You have no permission to edit this view.');
                return;
            }

            var w = null;
            if ($scope.isMobile()) {
                w = window.open('');
            }
            var mode = {};
            mode.permission = $scope.view.permission;
            mode.group = $scope.view.group;
            mode._groupMembers = $scope.view._groupMembers;
            $community.createNote(mode, function(note) {
                $scope.createContainsLink(note._id, $scope.getNewElementPosition());
                $scope.openContribution(note._id, null, w);
            });
        };

        $scope.createDrawing = function() {
            if (!$scope.isEditable()) {
                window.alert('You have no permission to edit this view.');
                return;
            }

            var w = null;
            if ($scope.isMobile()) {
                w = window.open('');
            }
            $community.createDrawing(function(drawing) {
                $scope.createContainsLink(drawing._id, {
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                    showInPlace: true
                });
                $scope.openContribution(drawing._id, null, w);
            });
        };

        $scope.viewAdded = function(view) {
            $scope.createContainsLink(view._id, $scope.getNewElementPosition());
            $scope.status.isViewManagerCollapsed = true;
        };

        $scope.createRiseabove = function(title) {
            var mode = {};
            mode.permission = $scope.view.permission;
            mode.group = $scope.view.group;
            mode._groupMembers = $scope.view._groupMembers;
            $community.createView('riseabove:', function(view) {
                $community.createNote(mode, function(note) {
                    note.title = title;
                    $community.makeRiseabove(note, view._id, function(note) {
                        $scope.createContainsLink(note._id, $scope.getNewElementPosition(), function() {});
                    });
                });
            }, true, mode);
        };

        $scope.getNewElementPosition = function() {
            var canvas = $('#maincanvas');
            var pos = {
                x: canvas.scrollLeft() + 100,
                y: canvas.scrollTop() + 100
            };
            while ($scope.findElement(pos)) {
                pos.x = pos.x + 10;
                pos.y = pos.y + 10;
            }
            return pos;
        };

        $scope.findElement = function(pos) {
            var len = $scope.refs.length;
            for (var i = 0; i < len; i++) {
                var each = $scope.refs[i];
                if (each.data.x === pos.x && each.data.y === pos.y) {
                    return each;
                }
            }
            return null;
        };

        $scope.openModal = function() {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'RiseaboveCreationModal.html',
                controller: 'RiseaboveCreationCtrl',
                size: 'lg',
                appendTo: document
            });

            modalInstance.result.then(function(name) {
                $scope.createRiseabove(name);
            }, function() {
                //dismiss
            });
        };

        $scope.createViewlink = function() {
            if (!$scope.isEditable()) {
                window.alert('You have no permission to edit this view.');
                return;
            }
            $scope.status.isViewlinkCollapsed = !$scope.status.isViewlinkCollapsed;
        };

        $scope.createContainsLink = function(toId, data, handler) {
            $scope.createContainsLink0($scope.view._id, toId, data, handler);
        };

        $scope.createContainsLink0 = function(viewId, toId, data, handler) {
            $community.createLink(viewId, toId, 'contains', data, handler);
        };

        $scope.saveRef = function(ref) {
            $community.saveLink(ref);
        };

        $scope.openAttachment = function() {
            if (!$scope.isEditable()) {
                window.alert('You have no permission to edit this view.');
                return;
            }
            $scope.status.isAttachmentCollapsed = !$scope.status.isAttachmentCollapsed;
        };

        $scope.uploadFiles = function(files, x, y) {
            $scope.status.isAttachmentCollapsed = false;
            $scope.$apply();
            var $files = [];
            for (var i = 0; i < files.length; i++) {
                $files.push(files[i]);
            }
            if ($scope.status.onFileSelect) {
                $scope.status.onFileSelect($files, x, y);
            } else {
                //ERROR
            }
        };

        $scope.attachmentUploaded = function(attachment, x, y) {
            // $http.post('/api/links', {
            //     from: $scope.view._id,
            //     to: attachment._id,
            //     type: 'contains',
            //     data: {
            //         x: 200,
            //         y: 200,
            //         width: 200,
            //         height: 200
            //     }
            // }).success(function() {
            //     $timeout(function() {
            //         $scope.status.isAttachmentCollapsed = true;
            //         $scope.$digest($scope.status.isAttachmentCollapsed);
            //     }, 500);
            // });

            var newX = x ? x : 200;
            var newY = y ? y : 200;

            var w = 200,
                h = 200;
            if (attachment.data.type.indexOf("image/") >= 0) {
                w = attachment.data.width;
                h = attachment.data.height;
                if (w > 200) {
                    w = 200;
                }
                h = (w * h) / attachment.data.width;
            }

            $http.post('/api/links', {
                from: $scope.view._id,
                to: attachment._id,
                type: 'contains',
                data: {
                    x: newX,
                    y: newY,
                    width: w,
                    height: h
                }
            }).success(function(link) {
                $timeout(function() {
                    $scope.status.isAttachmentCollapsed = true;
                    $scope.$digest($scope.status.isAttachmentCollapsed);
                    if (attachment.data.type.indexOf("image/") >= 0) {
                        var ref = $scope.searchById($scope.refs, link._id);
                        $scope.contextTarget = ref;
                        $scope.contextTarget.data.showInPlace = true;
                        $scope.saveRef($scope.contextTarget);
                    }
                }, 500);
            });
        };

        $scope.openSearch = function() {
            var url = '/search/' + $scope.view.communityId;
            window.open(url, '_blank');
        };

        $scope.openHelp = function() {
            var url = '/help/';
            window.open(url, '_blank');
        };

        // $scope.openViewProperty = function() {
        //     var url = './contribution/' + viewId;
        //     window.open(url, '_blank');
        // };

        $scope.openWorkspace = function() {
            var author = $scope.community.author;
            if (!author) {
                window.alert('author has not loaded yet.');
                return;
            }
            if (author.data && author.data.workspaces) {
                $scope.openWorkspace0(author.data.workspaces[0]);
            } else {
                $scope.createWorkspace(author, function(workspace) {
                    $scope.openWorkspace0(workspace._id);
                });
            }
        };

        $scope.openScaffolds = function() {
            var url = '/scaffoldmanager/' + $scope.view.communityId;
            window.open(url, '_scaffoldmanager');
        };

        $scope.openViewSetting = function() {
            var url = '/contribution/' + $scope.view._id;
            window.open(url, '_blank');
            $scope.status.isSettingCollapsed = true;
        };

        $scope.openCommunitySetting = function() {
            $community.getContext(null, function(context) {
                var url = '/contribution/' + context._id;
                window.open(url, '_blank');
                $scope.status.isSettingCollapsed = true;
            });
        };

        $scope.openAuthors = function() {
            var url = '/authormanager/' + $scope.view.communityId;
            window.open(url, '_blank');
        };

        $scope.openGroups = function() {
            var url = '/groupmanager/' + $scope.view.communityId;
            window.open(url, '_blank');
        };

        $scope.createWorkspace = function(author, handler) {
            var title = author.getName() + '\'s workspace';
            $community.createView(title, function(view) {
                if (!author.data) {
                    author.data = {};
                }
                if (!author.data.workspaces) {
                    author.data.workspaces = [];
                }
                author.data.workspaces.push(view._id);
                $community.modifyObject(author, function() {
                    /* success */
                    if (handler) {
                        handler(view);
                    }
                }, function(err) {
                    /* error */
                    window.alert(JSON.stringify(err));
                    author.data.workspaces = undefined; /* roll back */
                });
            }, true, {
                permission: 'private'
            });
        };

        $scope.openWorkspace0 = function(viewId) {
            var url = './view/' + viewId;
            $scope.openInPopup(url);
        };

        $scope.openAnalytics = function() {
            $scope.status.isAnalyticsCollapsed = !$scope.status.isAnalyticsCollapsed;
        };

          $scope.openPromisingIdeas = function() {
            var url = 'promisingideas/' + $scope.view.communityId+'§§§'+viewId;
            $scope.openInPopup(url);
        };

        $scope.openTagCloud = function() {
            $scope.openAnalytics();
            var url = 'wcloud/' + $scope.view._id;
            $scope.openInPopup(url);
        };

        $scope.openActivityDashboard = function() {
            $scope.openAnalytics();
            var url = 'dashboard/' + $scope.view.communityId;
            window.open(url, '_blank');
        };

        $scope.openNoteDashboard = function() {
            $scope.openAnalytics();
            var url = 'dashboard2/' + $scope.view.communityId;
            window.open(url, '_blank');
        };

        $scope.openS2viz = function() {
            $scope.openAnalytics();
            var url = 's2viz/' + $scope.view.communityId;
            window.open(url, '_blank');
        };

        $scope.openTimemachine = function() {
            $scope.openAnalytics();
            var url = 'timemachine/' + $scope.view._id;
            window.open(url, '_blank');
        };

        $scope.openLexicalAnalysis = function() {
            $scope.openAnalytics();
            var url = 'lexicalanalysis/' + $scope.view.communityId;
            $scope.openInPopup(url);
        };

        $scope.openScafoldSupportTracker = function() {
            $scope.openAnalytics();
            var url = 'scaffoldsupporttracker/' + $scope.view.communityId;
            $scope.openInPopup(url);
        };

        $scope.openStats = function() {
            var url = '/stats/' + $scope.view.communityId;
            window.open(url, '_blank');
        };
        $scope.openAuthorNetwork = function() {
            $scope.openAnalytics();
            var url = 'authornetwork/' + $scope.view._id;
            window.open(url, '_blank');
        };

        $scope.doExit = function() {
            var url = '';
            $scope.gotoURL(url);
        };

        /* ----------- open window --------- */

        $scope.openContribution = function(id, e, w) {
            if (e) {
                if (e.ctrlKey === true || e.button !== 0) {
                    return;
                }
            }
            var url = 'contribution/' + id + '/' + viewId;
            $rootScope.contributionId = id;
            $rootScope.contextId = viewId;
            if (w) {
                w.location.href = url;
                return;
            }
            if (!$kfutil.isMobile()) {
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
                var wid = 'ctrb_window_' + id;
                var str = '<div id="' + wid + '"></div>';
                var str1 = '<div style="height: 100%;display:block; width:100%;float:left;" ng-include="\'app/contribution/contribution.html\'" ng-controller="ContributionCtrl"></div>';
                $('#windows').append(str);
                $('#' + wid).append(str1);
                $compile($('#' + wid).contents())($scope);
                $('#' + wid).dialog({
                    width: width,
                    height: height,
                    create: function() {
                        $(this).css('padding', '1px');

                        //var contentWindow = document.getElementById(wid).contentWindow;
                        // contentWindow.wid = wid;
                        window.openContribution = function(id) {
                            return $scope.openContribution(id);
                        };
                        window.setInternalWindowTitle = function(title) {
                            $('#' + wid).dialog('option', 'title', title);
                        };
                    },
                    open: function() {
                        var iwnd = $(this).parent();
                        var x = iwnd.offset().left;
                        var y = iwnd.offset().top;
                        var offset = frames.length * 20;
                        iwnd.offset({
                            left: x + offset,
                            top: y + offset
                        });
                        frames.push(wid);
                    },
                    drag: function() {
                        _.remove(frames, function(n) {
                            return n === wid;
                        });
                    },
                    close: function() { /*we need to erase element*/
                        _.remove(frames, function(n) {
                            return n === wid;
                        });
                        $(this).remove();
                    }
                });
            } else {
                window.open(url);
            }

        };

        $scope.openView = function(id) {
            var url = 'view/' + id;
            $scope.gotoURL(url);
        };

        $scope.mOpenContribution = function() {
            $scope.openContribution($scope.contextTarget.to);
        };

        $scope.mOpenContributionInTab = function() {
            var url = 'contribution/' + $scope.contextTarget.to + '/' + viewId;
            window.open(url, '_blank');
        };

        $scope.mOpenContributionInPopup = function() {
            var url = 'contribution/' + $scope.contextTarget.to + '/' + viewId;
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
            return $scope.openByIFrame(url, width, height);
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

        var frames = [];

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
                    contentWindow.openContribution = function(id) {
                        return $scope.openContribution(id);
                    };
                    contentWindow.setInternalWindowTitle = function(title) {
                        $('#' + wid).dialog('option', 'title', title);
                    };
                },
                open: function() {
                    var iwnd = $(this).parent();
                    var x = iwnd.offset().left;
                    var y = iwnd.offset().top;
                    var offset = frames.length * 20;
                    iwnd.offset({
                        left: x + offset,
                        top: y + offset
                    });
                    frames.push(wid);
                },
                drag: function() {
                    _.remove(frames, function(n) {
                        return n === wid;
                    });
                },
                close: function() { /*we need to erase element*/
                    _.remove(frames, function(n) {
                        return n === wid;
                    });
                    $(this).remove();
                }
            });
            return wid;
        };

        /* ----------- context menu --------- */

        $scope.canvasMenuOpen = function(){
            if($rootScope.clipboardData !== undefined){
                $scope.canvasMenu = true;
            }
            else{
                $scope.canvasMenu = false;
            }
        };

        $scope.onContextOpen = function(childScope) {
            $scope.contextTarget = childScope.ref;
            var selected = $scope.getSelectedModels();
            var result = true;
            var author = $scope.community.author._id;
            if($scope.community.author.role === 'manager'){
                result = true;
            }
            else{
                selected.some(function(ref){
                    if(ref._to.authors.indexOf(author) < 0){
                        result = false;
                        return true;
                    }
                });
            }
            $scope.isDeletable = result;
        };

        $scope.copy2Clipboard = function(){
            $rootScope.clipboardData = $scope.contextTarget._id;
            window.alert("Note has been copied to clipboard.");
        };
        $scope.pasteNote = function(e){
            //get noteid from copy board and then create a new note from this note
            var clipboardData = $rootScope.clipboardData;
            $http.get('/api/links/' + clipboardData).success(function(link) {
                var data = {};
                data.x = e.clientX - 30;
                data.y = e.clientY - 34;
                if(link.data){
                    if(link.data.width){
                        data.width = link.data.width;
                    }
                    if(link.data.height){
                        data.height = link.data.height;
                    }
                    if(link.data.showInPlace){
                        data.showInPlace = link.data.showInPlace;
                    }
                }
                $scope.createContainsLink(link.to, data);
            });
        };

        $scope.drawOnImage = function() {
            if(!$('#drawingEditor').length){
                //create new equatio Editor
                var str = '<div id="drawingEditor" class="drawingEditor">';
                str += '<input type="hidden" name="targetImage" value=""/>';
                str += '<iframe style="display: block;" id="svg-drawing" height="500px" width="100%" src="manual_components/svg-edit-2.8.1/svg-editor.html" onload="onSvgDrawingInitialized();"></iframe>';
                str += '<div class="drawing-btn-area"><span id="drawing_cancel" class="drawing-btn" title="Close">Cancel</span>';
                str += '<span id="drawing_save" class="drawing-btn" title="Save as image">Save</span></div>';
                str += '</div>';
                str += '<canvas id="export_canvas"></canvas>';
                str += '<div id="drawing_overlay" class="ui-widget-overlay ui-front" style="z-index: 102;"></div>';
                $('body').append(str);
                $('#drawing_cancel').bind("click", function(){
                    $('#drawingEditor').css("display","none");
                    $('#drawing_overlay').css("display","none");
                });
                $('#drawingEditor input[name=targetImage]').val($scope.contextTarget.contribution.data.url);
            }
            else{
                $('#drawingEditor input[name=targetImage]').val($scope.contextTarget.contribution.data.url);
                onSvgDrawingInitialized();
            }
            $('#drawing_save').unbind("click");
            $('#drawing_save').bind("click", function(){
                    //save new image to contribution
                    var svgCanvas = document.getElementById('svg-drawing').contentWindow.svgEditor.canvas;
                    var c = document.getElementById('export_canvas');
                    c.width = svgCanvas.contentW;
                    c.height = svgCanvas.contentH;
                    var str = svgCanvas.svgCanvasToString();
                    canvg(c,str, {renderCallback: function() {
                                var canvas = document.getElementById("export_canvas");
                                var img = canvas.toDataURL($scope.contextTarget.contribution.data.type);
                                var file = {};
                                file.communityId = $scope.contextTarget.communityId;
                                file._id = $scope.contextTarget.contribution._id;
                                file.name = $scope.contextTarget.contribution.data.filename;
                                file.version = $scope.contextTarget.contribution.data.version + 1;
                                file.type = $scope.contextTarget.contribution.data.type;
                                $http.post('/api/upload/newImage', {
                                    data: img,
                                    file: file
                                }).success(function(result) {
                                    $scope.contextTarget.contribution = result;
                                    $('#drawing_cancel').trigger("click");
                                });
                    
                    }});
            });
            $('#drawing_overlay').css("display","block");
            $('#drawingEditor').css("display","block");
            
        };


        $scope.showAsIcon = function() {
            $scope.contextTarget.data.showInPlace = false;
            $scope.saveRef($scope.contextTarget);
        };

        $scope.showInPlace = function() {
            $scope.contextTarget.data.showInPlace = true;
            $scope.saveRef($scope.contextTarget);
        };

        $scope.lock = function(ref) {
            if (!ref) {
                ref = $scope.contextTarget;
            }
            if (!ref) {
                window.alert('ERROR: no reference on lock/unlock');
                return;
            }
            if (!$scope.isLockable(ref)) {
                window.alert('You are not able to lock this object.');
                return;
            }
            ref.data.fixed = true;
            ref.data.draggable = false;
            $scope.saveRef(ref);
            $scope.clearSelection();
        };
        $scope.fix = function(ref){
            if (!ref) {
                ref = $scope.contextTarget;
            }
            if (!ref) {
                window.alert('ERROR: no reference on fix/unfix');
                return;
            }
            if (!$scope.isFixable(ref)) {
                window.alert('You are not able to fix this object.');
                return;
            }

            ref.data.draggable = false;
            $scope.saveRef(ref);
            $scope.clearSelection();
        };
        $scope.unlock = function(ref) {
            if (!ref) {
                ref = $scope.contextTarget;
            }
            if (!ref) {
                window.alert('ERROR: no reference on lock/unlock');
                return;
            }
            if (!$scope.isUnlockable(ref)) {
                window.alert('You are not able to unlock this object.');
                return;
            }
            ref.data.fixed = false;
            ref.data.draggable = true;
            $scope.saveRef(ref);
        };
        $scope.unfix = function(ref) {
            if (!ref) {
                ref = $scope.contextTarget;
            }
            if (!ref) {
                window.alert('ERROR: no reference on fix/unfix');
                return;
            }
            if (!$scope.isUnfixable(ref)) {
                window.alert('You are not able to unfix this object.');
                return;
            }
            ref.data.draggable = true;
            $scope.saveRef(ref);
        };
        $scope.isFixable = function(ref) {
            //return $scope.hasLockControl();
            if (!ref) {
                ref = $scope.contextTarget;
            }
            if (!ref) {
                return false;
            }
            return (ref.data.draggable === undefined || ref.data.draggable) && $scope.isEditable();
        };
        $scope.isLockable = function(ref) {
            if (!ref) {
                ref = $scope.contextTarget;
            }
            if (!ref) {
                return false;
            }
            return !ref.data.fixed && $scope.isEditable();
        };
        $scope.isUnlockable = function(ref) {
            if (!ref) {
                ref = $scope.contextTarget;
            }
            if (!ref) {
                return false;
            }

            var fixed = ref.data.fixed;
            //return !$scope.isLocked(ref) || $scope.hasLockControl();
            return fixed !== undefined && fixed;
        };
        $scope.isUnfixable = function(ref) {
            if (!ref) {
                ref = $scope.contextTarget;
            }
            if (!ref) {
                return false;
            }

            var locked = ref.data.draggable;
            return locked !== undefined && !locked;
        };

        $scope.hasLockControl = function() {
            return $community.amIAuthor($scope.view);
        };

        $scope.delete = function(ref) {
            var selected = $scope.getSelectedModels();
            var confirmation = window.confirm('Are you sure to delete the selected ' + selected.length + ' object(s)?');
            if (!confirmation) {
                return;
            }
            selected.forEach(function(each) {
                $http.delete('/api/links/' + each._id);
            });
        };

        $scope.createRiseaboveFromContextMenu = function() {
            var selected = $scope.getSelectedModels();
            var confirmation = window.confirm('Are you sure to create riseabove using the selected ' + selected.length + ' object(s)?');
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
            var mode = {};
            mode.permission = $scope.view.permission;
            mode.group = $scope.view.group;
            mode._groupMembers = $scope.view._groupMembers;
            $community.createView('riseabove:', function(view) {
                $community.createNote(mode, function(note) {
                    note.title = 'Riseabove';
                    $community.makeRiseabove(note, view._id, function(note) {
                        $scope.createContainsLink(note._id, {
                            x: topleft.x + 50,
                            y: topleft.y + 50
                        }, function() {
                            selected.forEach(function(each) {
                                $scope.createContainsLink0(view._id, each.to, {
                                    x: each.data.x - topleft.x + 20,
                                    y: each.data.y - topleft.y + 20
                                }, function() {
                                    $http.delete('/api/links/' + each._id);
                                });
                            });
                        });
                    });
                });
            }, true, mode);
        };

    });


function closeDialog(wid) {
    $('#' + wid).dialog('close');
}

angular.module('kf6App')
    .controller('RiseaboveCreationCtrl', function($scope, $modalInstance) {
        $scope.name = '';
        $scope.ok = function() {
            if (!$scope.name || $scope.name.length === 0) {
                window.alert('Please input a name.');
                return;
            }
            $modalInstance.close($scope.name);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });
