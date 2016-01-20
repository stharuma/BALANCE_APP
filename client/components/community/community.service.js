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

        var enter = function(newId, authorHandler) {
            if (!newId) {
                console.warn('bad newId: ' + newId);
                return;
            }
            var currentUserId = Auth.getCurrentUser()._id;
            if (communityId !== newId || userId !== currentUserId) {
                userId = currentUserId;
                communityId = newId;

                refreshAuthor(authorHandler);
                refreshCommunity();
                refreshViews();
                //refreshMembers(); // it takes cost
            } else {
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
            searchContext(objId, function(context) {
                success(context);
            }, function() {
                createContext(objId, success);
            });
        };

        var searchContext = function(objId, success, failure) {
            $http.get('/api/links/from/' + objId).success(function(links) {
                var contextIds = [];
                links.forEach(function(link) {
                    if (link.type === 'has' && link._to.type === 'Context') {
                        contextIds.push(link.from);
                    }
                });

                if (contextIds.length > 0) {
                    return $http.get('/api/objects/' + contextIds[0]).success(function(context) {
                        success(context);
                    }).error(function() {
                        failure();
                    });
                } else {
                    failure();
                }
            }).error(function() {
                failure();
            });
        };

        var createContext = function(objId, success) {
            $http.post('/api/contexts/' + communityId, {
                type: 'Context'
            }).success(function(context) {
                $http.post('/api/links/', {
                    type: 'has',
                    from: objId,
                    to: context._id
                }).success(function( /*link*/ ) {
                    success(context);
                });
            });
        };

        var refreshScaffolds = function(handler) {
            $http.get('/api/communities/' + communityId).success(function(community) {
                communityData.scaffolds.length = 0; //clear once
                var scaffoldIds = community.scaffolds;
                var len = scaffoldIds.length;
                var numOfFinished = 0;
                if (numOfFinished >= len) {
                    if (handler) {
                        handler();
                    }
                }
                scaffoldIds.forEach(function(scaffoldId) {
                    var newScaffold = {};
                    communityData.scaffolds.push(newScaffold);
                    getObject(scaffoldId, function(scaffold) {
                        _.extend(newScaffold, scaffold);
                        fillSupport(newScaffold, function() {
                            numOfFinished++;
                            if (numOfFinished >= len) {
                                if (handler) {
                                    handler();
                                }
                            }
                        });
                    }, function() {
                        if (numOfFinished >= len) {
                            if (handler) {
                                handler();
                            }
                        }
                    });
                });
            });
        };

        var fillSupport = function(scaffold, handler) {
            $http.get('/api/links/from/' + scaffold._id).success(function(supports) {
                scaffold.supports = _.sortBy(supports, function(n) {
                    if (n.data && n.data.order) {
                        return n.data.order;
                    }
                    return 0;
                });
                if (handler) {
                    handler();
                }
            });
        };

        var createNoteCommon = function(fromId, success) {
            var newobj = {
                communityId: communityId,
                type: 'Note',
                title: '',
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
                // TODO i18n dynamize statis translation below
                title: 'Dessin',
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
                var url = 'api/communities/' + communityId;
                $http.get(url).success(function(community) {
                    community.scaffolds.push(scaffold._id);
                    $http.put(url, community).success(function() {
                        success(scaffold);
                    });
                });
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

        var updateCommunity = function(obj, success) {
            var url = 'api/communities/' + communityId;
            $http.get(url).success(function(community) {
                _.extend(community, obj); /* dont use merge, for overriding array */
                $http.put(url, community).success(function() {
                    success();
                });
            });
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

        var createDefaultScaffold = function(handler) {
            createScaffold('Theory Building', function(scaffold) {
                createSupport(scaffold, 'My theory', 0, function() {});
                createSupport(scaffold, 'A better theory', 1, function() {});
                createSupport(scaffold, 'New Information', 2, function() {});
                createSupport(scaffold, 'This theory cannot explain', 2, function() {});
                createSupport(scaffold, 'I need to understand', 2, function() {});
                createSupport(scaffold, 'Putting our knowledge together', 2, function() {});
                handler();
            });
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
            createDefaultScaffold: createDefaultScaffold,
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
