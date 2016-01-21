'use strict';

angular.module('kf6App')
    .factory('$community', function($http, Auth) {

        var userId = null;
        var communityId = null;

        var communityData = {};
        communityData.community = null;
        communityData.author = null;
        communityData.views = [];
        // We need to hold two forms, because those collections might be watched by angular
        communityData.members = {};
        communityData.membersArray = [];
        communityData.groups = {};
        communityData.groupsArray = [];
        communityData.scaffolds = [];

        var rootContext;

        var enter = function(newId, authorHandler, communityHandler) {
            if (!newId) {
                console.warn('bad newId: ' + newId);
                return;
            }
            var currentUserId = Auth.getCurrentUser()._id;
            if (communityId !== newId || userId !== currentUserId) {
                userId = currentUserId;
                communityId = newId;
                rootContext = null; //clear

                refreshCommunity(function() {
                    if (communityHandler) {
                        communityHandler();
                    }
                    refreshViews();
                    refreshAuthor(authorHandler);
                });
            } else {
                if (communityHandler) {
                    communityHandler();
                }
                if (authorHandler) {
                    authorHandler();
                }
            }
        };

        var refreshCommunity = function(handler) {
            if (!communityId) {
                return;
            }
            communityData.community = {};
            $http.get('/api/communities/' + communityId).success(function(community) {
                communityData.community = community;
                if (handler) {
                    handler(community);
                }
            });
        };

        var refreshViews = function(handler) {
            if (!communityId) {
                return;
            }
            $http.get('/api/communities/' + communityId + '/views').success(function(result) {
                communityData.views.length = 0; //clear once
                result.forEach(function(each) {
                    communityData.views.push(each);
                });
                if (handler) {
                    handler();
                }
            }).error(function() {
                console.error('view retrieving error');
            });
        };

        /* this should be refresh */
        var refreshMembers = function(handler) {
            $http.get('/api/communities/' + communityId + '/authors').success(function(authors) {
                authors.forEach(function(each) {
                    var author = getMember(each._id);
                    _.extend(author, each);
                    author.name = author.getName();
                });
                if (handler) {
                    handler();
                }
            });
        };

        var getMember = function(id) {
            if (id === null || id === '') {
                return createAuthor(undefined);
            }
            if (!(id in communityData.members)) {
                var member = createAuthor(id);
                communityData.members[id] = member;
                communityData.membersArray.push(member);
            }
            return communityData.members[id];
        };

        var createAuthor = function(id) {
            return {
                _id: id,
                name: 'NA',
                firstName: 'N',
                lastName: 'A',
                getName: function() {
                    return this.firstName + ' ' + this.lastName;
                }
            };
        };

        var getAuthor = function() {
            return communityData.author;
        };

        var refreshAuthor = function(handler) {
            if (!communityId) {
                return;
            }
            communityData.author = createAuthor();
            $http.get('/api/authors/' + communityId + '/me').success(function(author) {
                _.extend(communityData.author, author);
                if (handler) {
                    handler(author);
                }
            });
        };

        var getContext = function(objId, success) {
            var postprocess = function(context) {
                if (context && !context.data) {
                    context.data = {};
                }
                if (success) {
                    success(context);
                }
            };
            if (rootContext) {
                postprocess(rootContext);
            } else {
                getRootContext(postprocess);
            }
            // searchContext(objId, function(context) {
            //     success(context);
            // }, function() {
            //     createContext(objId, success);
            // });
        };

        // var searchContext = function(objId, success, failure) {
        //     $http.get('/api/links/from/' + objId).success(function(links) {
        //         var contextIds = [];
        //         links.forEach(function(link) {
        //             if (link.type === 'has' && link._to.type === 'Context') {
        //                 contextIds.push(link.from);
        //             }
        //         });

        //         if (contextIds.length > 0) {
        //             return $http.get('/api/objects/' + contextIds[0]).success(function(context) {
        //                 success(context);
        //             }).error(function() {
        //                 failure();
        //             });
        //         } else {
        //             failure();
        //         }
        //     }).error(function() {
        //         failure();
        //     });
        // };

        // var createContext = function(objId, success) {
        //     $http.post('/api/contexts/' + communityId, {
        //         type: 'Context'
        //     }).success(function(context) {
        //         $http.post('/api/links/', {
        //             type: 'has',
        //             from: objId,
        //             to: context._id
        //         }).success(function( /*link*/ ) {
        //             success(context);
        //         });
        //     });
        // };

        var getRootContext = function(handler) {
            var contextId = communityData.community.rootContextId;
            if (contextId) {
                getObject(contextId, function(context) {
                    rootContext = context;
                    handler(context);
                }, function() {
                    console.error('context undefined. dont come this state.');
                    handler(null);
                    //createRootContext(handler, handler);
                });
            } else {
                console.log('Call CreateRootContextBridge');
                createRootContextBridge(communityData.community, handler, handler);
            }
        };

        /* bridging program from 6.5.x to 6.6.x */
        var createRootContextBridge = function(community, success, failure) {
            createRootContext(community, function(context) {
                rootContext = context;
                refreshRegisteredScaffolds(function(scaffolds) {
                    if (scaffolds.length > 0) {
                        var scaffold = scaffolds[0];
                        usesScaffold(context, scaffold, 1, function() {
                            if (success) {
                                success(context);
                            }
                        });
                    }
                }, failure);
            }, failure);
        };

        var refreshScaffolds = function(handler) {
            getContext(null, function(context) {
                loadScaffoldLinks(context, function(links) {
                    communityData.scaffolds.length = 0; //clear once
                    var funcs = [];
                    links.forEach(function(link) {
                        funcs.push(function(handler) {
                            var scaffold = link._to;
                            scaffold._id = link.to;
                            communityData.scaffolds.push(scaffold);
                            fillSupport(scaffold, handler);
                        });
                    });
                    waitFor(funcs, handler);
                });
            });
        };

        communityData.registeredScaffolds = [];

        var refreshRegisteredScaffolds = function(handler) {
            $http.get('/api/communities/' + communityId).success(function(community) {
                communityData.registeredScaffolds.length = 0; //clear once
                var scaffoldIds = community.scaffolds;
                if (!scaffoldIds) {
                    scaffoldIds = [];
                }
                var funcs = [];
                scaffoldIds.forEach(function(scaffoldId) {
                    funcs.push(function(handler) {
                        var newScaffold = {
                            _id: scaffoldId
                        };
                        communityData.registeredScaffolds.push(newScaffold);
                        getObject(scaffoldId, function(scaffold) {
                            _.extend(newScaffold, scaffold);
                            fillSupport(newScaffold, handler);
                        });
                    });
                });
                waitFor(funcs, function() {
                    if (handler) {
                        handler(communityData.registeredScaffolds);
                    }
                });
            });
        };

        var waitFor = function(funcs, handler) {
            var len = funcs.length;
            if (len <= 0) {
                if (handler) {
                    handler();
                }
                return;
            }
            var numOfFinished = 0;
            funcs.forEach(function(func) {
                func(function() {
                    numOfFinished++;
                    if (numOfFinished >= len) {
                        if (handler) {
                            handler();
                        }
                    }
                });
            });
        };

        var objs2Ids = function(objs) {
            return _.map(objs, function(obj) {
                return obj._id;
            });
        };

        var createCommunity = function(title, key, success, failure) {
            $http.post('/api/communities', {
                title: title,
                registrationKey: key
            }).success(function(community) {
                createRootContext(community, function(context) {
                    enter(community._id, function() {
                        createView('Welcome', function() {
                            createDefaultScaffold(function(scaffold) {
                                usesScaffold(context, scaffold, 1, function() {
                                    if (success) {
                                        success(community);
                                    }
                                });
                            });
                        });
                    });
                }, failure);
            }).error(failure);
        };

        /* private */
        var createRootContext = function(community, success, failure) {
            retrieveManagers(community._id, function(managers) {
                var managerIds = objs2Ids(managers);
                $http.post('/api/contexts/' + community._id, {
                    title: 'the RootContext of ' + community.title,
                    type: 'Context',
                    authors: managerIds,
                    permission: 'protected',
                    data: {}
                }).success(function(context) {
                    updateCommunityWithId(community._id, {
                        rootContextId: context._id
                    }, function() {
                        success(context);
                    }, failure);
                }).error(failure);
            }, failure);
        };

        var retrieveManagers = function(communityId, success, failure) {
            $http.get('/api/communities/' + communityId + '/authors').success(function(authors) {
                var managers = [];
                authors.forEach(function(author) {
                    if (author.role === 'manager') {
                        managers.push(author);
                    }
                });
                if (managers.length <= 0) {
                    if (failure) {
                        failure();
                    }
                    return;
                }
                if (success) {
                    success(managers);
                }
            }).error(failure);
        };

        /* private */
        var createDefaultScaffold = function(handler) {
            createScaffold('Theory Building', function(scaffold) {
                var tasks = [];
                tasks.push(function(handler) {
                    createSupport(scaffold, 'My theory', 0, handler);
                });
                tasks.push(function(handler) {
                    createSupport(scaffold, 'A better theory', 1, handler);
                });
                tasks.push(function(handler) {
                    createSupport(scaffold, 'New Information', 2, handler);
                });
                tasks.push(function(handler) {
                    createSupport(scaffold, 'This theory cannot explain', 3, handler);
                });
                tasks.push(function(handler) {
                    createSupport(scaffold, 'I need to understand', 4, handler);
                });
                tasks.push(function(handler) {
                    createSupport(scaffold, 'Putting our knowledge together', 5, handler);
                });
                waitFor(tasks, function() {
                    if (handler) {
                        handler(scaffold);
                    }
                });
            });
        };

        var loadScaffoldLinks = function(context, handler) {
            getLinksFrom(context._id, 'uses', handler);
        };

        var getLinksFrom = function(fromId, type, success, failure) {
            $http.get('/api/links/from/' + fromId).success(function(links) {
                if (type) {
                    links = links.filter(function(each) {
                        return each.type === type;
                    });
                }
                links = _.sortBy(links, orderComparator);
                if (success) {
                    success(links);
                }
            }, failure);
        };

        var getLinksTo = function(toId, type, success, failure) {
            $http.get('/api/links/to/' + toId).success(function(links) {
                if (type) {
                    links = links.filter(function(each) {
                        return each.type === type;
                    });
                }
                links = _.sortBy(links, orderComparator);
                if (success) {
                    success(links);
                }
            }, failure);
        };

        var orderComparator = function(n) {
            if (n.data && n.data.order) {
                return n.data.order;
            }
            return 0;
        };

        var fillSupport = function(scaffold, handler) {
            $http.get('/api/links/from/' + scaffold._id).success(function(supports) {
                scaffold.supports = _.sortBy(supports, orderComparator);
                if (handler) {
                    handler();
                }
            });
        };

        var createNoteCommon = function(fromId, success) {
            var newobj = {
                communityId: communityId,
                type: 'Note',
                title: 'New Note',
                authors: [getAuthor()._id],
                status: 'unsaved',
                permission: 'protected',
                data: {
                    body: ''
                },
                buildson: fromId
            };
            $http.post('/api/contributions/' + communityId, newobj)
                .success(function(note) {
                    success(note);
                });
        };

        var createNote = function(success) {
            createNoteCommon(null, success);
        };

        var createNoteOn = function(fromId, success) {
            createNoteCommon(fromId, success);
        };

        var makeRiseabove = function(note, viewId, success) {
            var riseabove = {
                viewId: viewId
            };
            if (!note.data) {
                note.data = {};
            }
            note.status = 'active';
            note.data.riseabove = riseabove;
            modifyObject(note, function(note) {
                success(note);
            });
        };

        var createDrawing = function(success) {
            var newobj = {
                communityId: communityId,
                type: 'Drawing',
                title: 'a Drawing',
                authors: [getAuthor()._id],
                status: 'unsaved',
                permission: 'protected',
                data: {
                    svg: '<svg width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1<\/title><\/g><\/svg>',
                }
            };
            $http.post('/api/contributions/' + communityId, newobj)
                .success(function(drawing) {
                    success(drawing);
                });
        };

        var createView = function(title, success, noregistration, options) {
            var newobj = {
                communityId: communityId,
                type: 'View',
                title: title,
                authors: [getAuthor()._id],
                status: 'active',
                permission: 'public',
            };
            _.extend(newobj, options);
            $http.post('/api/contributions/' + communityId, newobj).success(function(view) {
                if (noregistration === true) {
                    success(view);
                } else {
                    var url = 'api/communities/' + communityId;
                    $http.get(url).success(function(community) {
                        community.views.push(view._id);
                        $http.put(url, community).success(function() {
                            success(view);
                        });
                    });
                }
            });
        };

        var removeView = function(view, success) {
            var url = 'api/communities/' + communityId;
            $http.get(url).success(function(community) {
                var newViews = [];
                community.views.forEach(function(each) {
                    if (each !== view._id) {
                        newViews.push(each);
                    }
                });
                community.views = newViews;
                $http.put(url, community).success(function() {
                    success();
                });
            });
        };

        var createScaffold = function(title, success) {
            var newobj = {
                communityId: communityId,
                type: 'Scaffold',
                title: title,
                authors: [getAuthor()._id],
                status: 'active',
                permission: 'protected'
            };
            $http.post('/api/contributions/' + communityId, newobj).success(function(scaffold) {
                registerScaffold(scaffold, success);
            });
        };

        /* private */
        var registerScaffold = function(scaffold, success) {
            var url = 'api/communities/' + communityId;
            $http.get(url).success(function(community) {
                community.scaffolds.push(scaffold._id);
                $http.put(url, community).success(function() {
                    if (success) {
                        success(scaffold);
                    }
                });
            });
        };

        var usesScaffold = function(context, scaffold, order, success) {
            var scaffoldId;
            if (scaffold._id) {
                scaffoldId = scaffold._id;
            } else {
                scaffoldId = scaffold;
            }
            var link = {};
            link.to = scaffoldId;
            link.from = context._id;
            link.type = 'uses';
            link.data = {
                order: order
            };
            $http.post('/api/links', link).success(function() {
                success(link);
            });
        };

        var createSupport = function(scaffold, title, order, success) {
            var newobj = {
                communityId: communityId,
                type: 'Support',
                title: title,
                authors: [getAuthor()._id],
                status: 'active',
                permission: 'protected'
            };
            $http.post('/api/contributions/' + communityId, newobj).success(function(support) {
                var link = {};
                link.to = support._id;
                link.from = scaffold._id;
                link.type = 'contains';
                link.data = {
                    order: order
                };
                $http.post('/api/links', link).success(function() {
                    success(support);
                });
            });
        };

        var createAttachment = function(success) {
            var newobj = {
                communityId: communityId,
                type: 'Attachment',
                title: 'an Attachment',
                authors: [getAuthor()._id],
                status: 'unsaved',
                permission: 'protected',
                data: {
                    version: 0
                }
            };
            $http.post('/api/contributions/' + communityId, newobj).success(function(attachment) {
                success(attachment);
            });
        };

        var createGroup = function(title, success) {
            var newobj = {
                communityId: communityId,
                type: 'Group',
                title: title,
                authors: [getAuthor()._id],
                members: [getAuthor()._id],
                status: 'active',
                permission: 'protected'
            };
            $http.post('/api/groups/' + communityId, newobj).success(function(group) {
                success(group);
            });
        };

        var updateCommunityWithId = function(communityId, obj, success, failure) {
            var url = 'api/communities/' + communityId;
            $http.get(url).success(function(community) {
                _.extend(community, obj); /* dont use merge, for overriding array */
                $http.put(url, community).success(function() {
                    if (success) {
                        success(community);
                    }
                }).error(failure);
            }).error(failure);
        };

        var updateCommunity = function(obj, success, failure) {
            if (!communityId) {
                if (failure) {
                    failure('no communityId');
                }
                return;
            }
            updateCommunityWithId(communityId, obj, success, failure);
        };

        var makeAuthorString = function(authorObjects) {
            var authorString = '';
            authorObjects.forEach(function(each) {
                if (authorString.length !== 0) {
                    authorString += ', ';
                }
                authorString += each.getName();
            });
            return authorString;
        };

        var makeAuthorStringByIds = function(authorIds) {
            var authorObjects = [];
            if (!authorIds) {
                return '(missing authors)';
            }
            authorIds.forEach(function(id) {
                authorObjects.push(getMember(id));
            });
            return makeAuthorString(authorObjects);
        };

        var amIAuthor = function(obj) {
            if (obj._to) { //link
                return amIAuthor0(obj._to.authors);
            } else if (obj.authors) { //contrib
                return amIAuthor0(obj.authors);
            } else {
                console.error('unsupported object=' + obj);
            }
        };

        var amIAuthor0 = function(authorIds) {
            return _.contains(authorIds, communityData.author._id);
        };

        var modifyObject = function(object, success, error) {
            $http.put('/api/objects/' + communityId + '/' + object._id, object).success(function(newobject) {
                if (newobject._id === communityData.author._id) {
                    _.extend(communityData.author, newobject);
                }
                if (success) {
                    success(newobject);
                }
            }).error(function(data) {
                if (error) {
                    error(data);
                } else {
                    window.alert('error on modifyObject: ' + data);
                }
            });
        };

        var getGroup = function(id) {
            if (!id) {
                return noneGroup;
            }
            if (!(id in communityData.groups)) {
                var group = createGroupSkelton(id);
                communityData.groups[id] = group;
                communityData.groupsArray.push(group);
            }
            return communityData.groups[id];
        };

        var createGroupSkelton = function(id) {
            return {
                _id: id,
                title: 'none'
            };
        };

        var noneGroup = createGroupSkelton(null);
        communityData.groupsArray.push(noneGroup);

        var refreshGroups = function(success, error) {
            $http.get('/api/communities/' + communityId + '/groups').success(function(groups) {
                groups.forEach(function(each) {
                    var group = getGroup(each._id);
                    _.extend(group, each);
                });
                if (success) {
                    success(groups);
                }
            }).error(function(data) {
                if (error) {
                    error(data);
                } else {
                    window.alert('error on refreshGroups: ' + data);
                }
            });
        };

        var getObject = function(id, success, error) {
            $http.get('/api/objects/' + id).success(function(obj) {
                if (success) {
                    success(obj);
                }
            }).error(function(data) {
                if (error) {
                    error(data);
                } else {
                    window.alert('error on getObject: ' + data);
                }
            });
        };

        var read = function(contribution) {
            if (!communityId) {
                console.error('error in making read mark.');
                return;
            }
            $http.post('/api/records/read/' + communityId + '/' + contribution._id).error(function() {
                console.error('error in making read mark.');
            });
        };

        return {
            getContext: getContext,

            enter: enter,
            getMember: getMember,
            refreshMembers: refreshMembers,
            getGroup: getGroup,
            refreshGroups: refreshGroups,

            createAttachment: createAttachment,
            createNote: createNote,
            createNoteOn: createNoteOn,
            createDrawing: createDrawing,
            createView: createView,
            createScaffold: createScaffold,
            createSupport: createSupport,
            createGroup: createGroup,

            createCommunity: createCommunity,
            //createDefaultScaffold: createDefaultScaffold,
            fillSupport: fillSupport,
            removeView: removeView,
            updateCommunity: updateCommunity,
            refreshViews: refreshViews,
            makeRiseabove: makeRiseabove,
            refreshScaffolds: refreshScaffolds,
            amIAuthor: amIAuthor,
            modifyObject: modifyObject,
            getObject: getObject,
            read: read,
            getAuthor: getAuthor,
            refreshAuthor: refreshAuthor,
            loadScaffoldLinks: loadScaffoldLinks,
            usesScaffold: usesScaffold,
            refreshRegisteredScaffolds: refreshRegisteredScaffolds,
            getLinksTo: getLinksTo,
            getLinksFrom: getLinksFrom,
            getViews: function() {
                return communityData.views;
            },
            getScaffolds: function() {
                return communityData.scaffolds;
            },
            getMembers: function() {
                return communityData.members;
            },
            getMembersArray: function() {
                return communityData.membersArray;
            },
            getCommunityData: function() {
                return communityData;
            },
            makeAuthorString: makeAuthorString,
            makeAuthorStringByIds: makeAuthorStringByIds
        };
    });