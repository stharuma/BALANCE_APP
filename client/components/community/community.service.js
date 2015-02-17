'use strict';

angular.module('kf6App')
    .factory('$community', function($http) {
        // We need to hold two forms, because those collections might be watched by angular
        var communityId = null;

        var communityData = {};
        communityData.community = null;
        communityData.author = null;
        communityData.views = [];
        communityData.members = {};
        communityData.membersArray = [];
        communityData.scaffolds = [];

        var enter = function(newId, authorHandler) {
            if (!newId) {
                console.log('bad newId: ' + newId);
                return;
            }
            if (communityId !== newId) {
                communityId = newId;
                refreshAuthor(authorHandler);
                refreshCommunity();
                refreshViews();
                //updateCommunityMembers();
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
                console.log('view retrieving error');
            });
        };

        /* this should be refresh */
        var updateCommunityMembers = function() {
            $http.get('/api/communities/' + communityId + '/authors').success(function(authors) {
                authors.forEach(function(each) {
                    var author = getMember(each._id);
                    _.extend(author, each);
                    author.name = author.getName();
                });
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
                    $http.get('/api/contributions/' + scaffoldId).success(function(scaffold) {
                        _.extend(newScaffold, scaffold);
                        fillSupport(newScaffold, function() {
                            numOfFinished++;
                            if (numOfFinished >= len) {
                                if (handler) {
                                    handler();
                                }
                            }
                        });
                    }).error(function() {
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
            scaffold.supports = [];
            $http.get('/api/links/from/' + scaffold._id).success(function(supports) {
                supports.forEach(function(support) {
                    scaffold.supports.push(support);
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
            $http.put('/api/contributions/' + communityId + '/' + note._id, note).success(function(note) {
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

        var createView = function(title, success, noregistration) {
            var newobj = {
                communityId: communityId,
                type: 'View',
                title: title,
                authors: [getAuthor()._id],
                status: 'active',
                permission: 'public',
            };
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
                console.log('unsupported object=' + obj);
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

        var read = function(contribution) {
            if (!communityId) {
                console.log('error in making read mark.');
                return;
            }
            $http.post('/api/records/read/' + communityId + '/' + contribution._id).error(function() {
                console.log('error in making read mark.');
            });
        };

        return {
            //login: login,
            enter: enter,
            getMember: getMember,
            updateCommunityMembers: updateCommunityMembers,
            createAttachment: createAttachment,
            createNote: createNote,
            createNoteOn: createNoteOn,
            createDrawing: createDrawing,
            createView: createView,
            createScaffold: createScaffold,
            createSupport: createSupport,
            createDefaultScaffold: createDefaultScaffold,
            fillSupport: fillSupport,
            removeView: removeView,
            updateCommunity: updateCommunity,
            refreshViews: refreshViews,
            makeRiseabove: makeRiseabove,
            refreshScaffolds: refreshScaffolds,
            amIAuthor: amIAuthor,
            modifyObject: modifyObject,
            read: read,
            //saveRegistration: saveRegistration,
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