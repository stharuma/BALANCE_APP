'use strict';

angular.module('kf6App')
    .factory('$community', function($http, Auth) {
        // We need to hold two forms, because those collections might be watched by angular
        var communityId = null;
        var views = [];
        var communityMembers = {};
        var communityMembersArray = [];

        var refreshViews = function() {
            $http.get('/api/views/community/' + communityId).success(function(result) {
                views.length = 0; //clear once
                result.forEach(function(each) {
                    views.push(each);
                });
            });
        };

        var enter = function(newId) {
            if (!newId) {
                console.log('bad newId: ' + newId);
                return;
            }
            if (communityId !== newId) {
                communityId = newId;
                refreshViews();
            }
        };

        var getMember = function(id) {
            if (id === null || id === '') {
                return {
                    name: 'NA'
                };
            }
            if (!(id in communityMembers)) {
                var user = {
                    _id: id,
                    email: 'hoge',
                    name: 'NA'
                };
                communityMembers[id] = user;
                communityMembersArray.push(user);
            }
            return communityMembers[id];
        };
        var updateCommunityMembers = function() {
            $http.get('/api/users/').success(function(members) {
                members.forEach(function(each) {
                    getMember(each._id).name = each.name;
                    getMember(each._id).email = each.email;
                });
            });
        };

        var createAttachment = function(url, file, success) {
            var authors = [Auth.getCurrentUser()._id];
            $http.post('/api/attachments', {
                communityId: communityId,
                title: file.name + ' (' + file.type + ')',
                url: url,
                originalName: file.name,
                mime: file.type,
                size: file.size,
                authors: authors
            }).success(function(attachment) {
                success(attachment);
            });
        };

        var createNoteCommon = function(fromId, success) {
            var authors = [Auth.getCurrentUser()._id];
            $http.post('/api/notes', {
                    communityId: communityId,
                    title: 'New Note',
                    body: '',
                    authors: authors,
                    buildson: fromId
                })
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

        var createDrawing = function(success) {
            var authors = [Auth.getCurrentUser()._id];
            $http.post('/api/drawings', {
                    communityId: communityId,
                    title: 'a Drawing',
                    svg: '<svg width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1<\/title><\/g><\/svg>',
                    authors: authors
                })
                .success(function(drawing) {
                    success(drawing);
                });
        };

        var createView = function(title, success) {
            $http.post('/api/views', {
                communityId: communityId,
                title: title
            }).success(function(view) {
                success(view);
            });
        };

        return {
            enter: enter,
            getMember: getMember,
            updateCommunityMembers: updateCommunityMembers,
            createAttachment: createAttachment,
            createNote: createNote,
            createNoteOn: createNoteOn,
            createDrawing: createDrawing,
            createView: createView,
            refreshViews: refreshViews,
            getViews: function() {
                return views;
            },
            getMembers: function() {
                return communityMembers;
            },
            getMembersArray: function() {
                return communityMembersArray;
            }
        };
    });