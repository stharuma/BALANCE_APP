'use strict';

angular.module('kf6App')
    .factory('$member', function($http) {
        var communityMembers = {};
        var getMember = function(id) {
            if (id === null || id === '') {
                return {
                    name: 'NA'
                };
            }
            if (!(id in communityMembers)) {
                communityMembers[id] = {
                    _id: id,
                    name: 'NA'
                };
            }
            return communityMembers[id];
        };
        var updateCommunityMembers = function() {
            $http.get('/api/users/').success(function(members) {
                members.forEach(function(each) {
                    getMember(each._id).name = each.name;
                });
            });
        };
        return {
            getMember: getMember,
            updateCommunityMembers: updateCommunityMembers,
            getMembers: function(){
            	return communityMembers;
            }
        };
    });