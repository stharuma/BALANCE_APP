'use strict';

/* global d3 */

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
        var context;

        var enter = function(newId, authorHandler, communityHandler) {
            if (!newId) {
                console.warn('bad newId: ' + newId);
                return;
            }
            var currentUserId = Auth.getCurrentUser()._id;
            if (communityId !== newId || userId !== currentUserId) {
                userId = currentUserId;
                communityId = newId;

                //clear
                rootContext = null;
                communityData.community = null;
                communityData.author = null;
                communityData.views = [];
                communityData.members = {};
                communityData.membersArray = [];
                communityData.groups = {};
                communityData.groupsArray = [];
                communityData.scaffolds = [];
                communityData.promisingcolorobjs=[];

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

        var refreshContext = function(contextId, handler) {
            if (!context && !contextId) {
                return handler(context);
            }
            if (context && context._id === contextId) {
                return handler(context);
            }
            //refresh
            getObject(contextId, function(obj) {
                context = obj;
                if (handler) {
                    handler(context);
                }
            });
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
        };

        var getRootContext = function(handler) {
            if (!communityData.community) {
                window.alert('getRootContext(): communityData is not initialized.');
            }
            var contextId = communityData.community.rootContextId;
            if (contextId) {
                getObject(contextId, function(context) {
                    rootContext = context;
                    handler(context);
                }, function() {
                    window.alert('context undefined. never come this state.');
                    return;
                });
            } else {
                window.alert('RootContextId database migration from 6.5.x to 6.6.x is needed.');
                return;
            }
        };

        var refreshScaffolds = function(handler) {
            if (context && context.data && context.data.scaffoldSettingEnabled) {
                refreshScaffolds0(context, handler);
            } else {
                getContext(null, function(context) {
                    refreshScaffolds0(context, handler);
                });
            }
        };

        // registredScaffolds and contextScaffolds
        // communityData.scaffolds means contextScaffolds
        communityData.registeredScaffolds = [];

        var refreshScaffolds0 = function(context, handler) {
            refreshRegisteredScaffolds(function() {
                loadScaffoldLinks(context, function(links) {
                    communityData.scaffolds.length = 0; //clear once
                    links.forEach(function(link) {
                        communityData.registeredScaffolds.forEach(function(each) {
                            if (link.to === each._id) {
                                communityData.scaffolds.push(each);
                            }
                        });
                    });
                    handler();
                });
            });
        };

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

        var createRootContext = function(community, success, failure) {
            retrieveManagers(community._id, function(managers) {
                var managerIds = objs2Ids(managers);
                $http.post('/api/contexts/' + community._id, {
                    title: 'Community Setting: ' + community.title,
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
                        failure('manager\'s length is zero.');
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

        var getLinksFromTo = function(fromId, toId, type, success, failure) {
            $http.get('/api/links/from/' + fromId + '/to/' + toId).success(function(links) {
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

        var createLink = function(fromId, toId, type, data, success, failure) {
            var link = {};
            link.from = fromId;
            link.to = toId;
            link.type = type;
            link.data = data;
            $http.post('/api/links/', link).success(function(arg) {
                if (success) {
                    success(arg);
                }
            }).error(function(arg) {
                if (failure) {
                    failure(arg);
                }
            });
        };

        var saveLink = function(ref) {
            $http.put('/api/links/' + ref._id, ref);
        };

        var deleteLink = function(link, callback) {
            $http.delete('/api/links/' + link._id).success(function() {
                if (callback) { callback(); }
            });
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

        var createNoteCommon = function(contextmode, fromId, success, content) {
            if (!content) {
                content = '';
            }

            if (contextmode && !contextmode.permission) {
                window.alert('invalid mode object');
                return;
            }

            var mode = {};
            if (contextmode && contextmode.permission === 'private') {
                mode.permission = contextmode.permission;
                mode.group = contextmode.group;
            } else {
                mode.permission = 'protected';
                mode.group = undefined;
            }

            var newobj = {
                communityId: communityId,
                type: 'Note',
                title: '',
                /* 6.6 the default title was changed to blank by Christian */
                authors: [getAuthor()._id],
                status: 'unsaved',
                permission: mode.permission,
                group: mode.group,
                data: {
                    body: content
                },
                buildson: fromId
            };
            $http.post('/api/contributions/' + communityId, newobj)
                .success(function(note) {
                    success(note);
                });
        };

        var createNote = function(mode, success, content) {
            createNoteCommon(mode, null, success, content);
        };

        var createNoteOn = function(mode, fromId, success) {
            createNoteCommon(mode, fromId, success);
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
                /* We need a default title for convinience. We need to think i18n */
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
                if (success) {
                    success(link);
                }
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
            return _.includes(authorIds, communityData.author._id);
        };

        var modifyObjects = function(objects, success, error) {
            var funcs = [];
            objects.forEach(function(object) {
                funcs.push(function(handler) {
                    modifyObject(object, handler, error);
                });
            });
            waitFor(funcs, success);
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

        var makeDefaultViewSetting = function(setting) {
            var defaultSetting = {
                buildson: true,
                // TODO: negotiate if and how reference links should be display by default, because views can become quickly loaded.
                references: false,
                showGroup: true,
                showAuthor: true,
                showTime: true
            };
            if (setting) {
                return _.merge(defaultSetting, setting);
            } else {
                return defaultSetting;
            }
        };

        var notify = function(contribution, contextId) {
            var obj = {};
            obj.author = getAuthor();
            obj.contribution = contribution;
            obj.contextId = contextId;
            $http.post('/api/notifications/notify/' + communityId, obj);
        };

        var getRecords = function(handler) {
            $http.post('api/records/search/' + communityId, {}).success(function(records) {
                if (handler) {
                    handler(records);
                }
            });
        };

        var searchHistoricalObjects = function(query, handler) {
            var postquery = { query: query };
            $http.post('api/historicalobjects/' + communityId + '/search', postquery).success(function(objects) {
                if (handler) {
                    handler(objects);
                }
            });
        };

        var getContributionCatalog = function(handler) {
            var query = {
                communityId: communityId,
                pagesize: 100000
            };
            $http.post('/api/contributions/' + communityId + '/search', {
                query: query
            }).success(function(contributions) {
                var catalog = {};
                contributions.forEach(function(contribution) {
                    catalog[contribution._id] = contribution;
                });
                if (handler) {
                    handler(catalog);
                }
            });
        };

        var getSocialInteractions = function(handler) {
            refreshMembers(function() {
                getRecords(function(records) {
                    getContributionCatalog(function(catalog) {
                        var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;
                        var interactions = [];
                        records.forEach(function(record) {
                            var author = communityData.members[record.authorId];
                            var object = catalog[record.targetId];
                            if (!object) {
                                return;
                            }
                            var toAuthor = communityData.members[object.authors[0]];
                            var d = {
                                from: author.name,
                                type: record.type,
                                title: object.title,
                                to: toAuthor.name,
                                when: record.timestamp
                            };
                            d.date = parseDate(d.when);
                            d.year = d3.time.year(d.date);
                            d.month = d3.time.month(d.date);
                            d.day = d3.time.day(d.date);
                            d.week = d3.time.week(d.date);

                            d.value = 1;
                            d.read = 0;
                            d.modify = 0;
                            d.buildson = 0;
                            d[d.type] = 1;
                            interactions.push(d);
                        });
                        if (handler) {
                            handler(interactions);
                        }
                    });
                });
            });
        };

         var createPromisingcolorobj = function (promisingIdeacolorobj, success) {
             var newobj = {
                 communityId: communityId,
                 type: 'promisingIdeacolorobj',
                 title: 'an promisingIdeacolorobj',
                 authors: getAuthor()._id,
                 status: 'active',
                 permission: 'protected',
                 data: promisingIdeacolorobj
             };
             $http.post('/api/contributions/' + communityId, newobj).success(function (pcolorobj) {
                 registerPromisingcolorobj(pcolorobj, success);
             });
         };

         var registerPromisingcolorobj = function (promisingcolorobj, success) {
             var url = 'api/communities/' + communityId;
             $http.get(url).success(function (community) {
                 if (!community.promisingcolorobjs) {
                     community.promisingcolorobjs = [];
                 }
                 community.promisingcolorobjs.push(promisingcolorobj._id);
                 $http.put(url, community).success(function () {
                     if (success) {
                         success(promisingcolorobj);
                     }
                 });
             });
         };

         var refreshPromisingcolorobjs = function (handler) {
             $http.get('/api/communities/' + communityId).success(function (community) {
                 communityData.promisingcolorobjs.length = 0; //clear once
                 var promisingcolorobjIds = community.promisingcolorobjs;
                 if (!promisingcolorobjIds) {
                     promisingcolorobjIds = [];
                 }
                 promisingcolorobjIds.forEach(function (promisingcolorobjId, index) {
                     getObject(promisingcolorobjId, function (promisingcolorobj) {
                         communityData.promisingcolorobjs.push(promisingcolorobj);
                         if (handler&& index===promisingcolorobjIds.length-1) {
                             handler();
                         }
                     });
                 });
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
            createPromisingcolorobj: createPromisingcolorobj,

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
            modifyObjects: modifyObjects,
            getObject: getObject,
            read: read,
            getAuthor: getAuthor,
            refreshAuthor: refreshAuthor,
            loadScaffoldLinks: loadScaffoldLinks,
            refreshRegisteredScaffolds: refreshRegisteredScaffolds,
            refreshPromisingcolorobjs: refreshPromisingcolorobjs,
            getLinksTo: getLinksTo,
            getLinksFrom: getLinksFrom,
            getLinksFromTo: getLinksFromTo,
            createLink: createLink,
            saveLink: saveLink,
            deleteLink: deleteLink,
            notify: notify,
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
            getPromisingcolorobjsArray: function() {
                return communityData.promisingcolorobjs;
            },
            makeAuthorString: makeAuthorString,
            makeAuthorStringByIds: makeAuthorStringByIds,

            usesScaffold: usesScaffold,
            createRootContext: createRootContext /*for migration tool*/ ,
            refreshContext: refreshContext,

            makeDefaultViewSetting: makeDefaultViewSetting,

            /* Utilities */
            waitFor: waitFor,

            /* LA */
            searchHistoricalObjects: searchHistoricalObjects,
            getRecords: getRecords,
            getSocialInteractions: getSocialInteractions
        };
    });
