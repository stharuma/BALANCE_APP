'use strict';

angular.module('kf6App')
    .factory('$member', function($http) {
        // We need to hold two forms, because those collections might be watched by angular
        var communityMembers = {};
        var communityMembersArray = [];
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
        return {
            getMember: getMember,
            updateCommunityMembers: updateCommunityMembers,
            getMembers: function() {
                return communityMembers;
            },
            getMembersArray: function() {
                return communityMembersArray;
            }
        };
    });