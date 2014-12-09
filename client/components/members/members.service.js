angular.module('kf6App')
    .factory('$member', function($http) {
        var communityMembers = {};
        var getMember = function(id) {
            if (id === null) {
                return null;
            }
            if (!(id in communityMembers)) {
                communityMembers[id] = {
                    _id: id,
                    name: ""
                };
            }
            return communityMembers[id];
        };
        var updateCommunityMembers = function(handler) {
            $http.get('/api/users/').success(function(members) {
                members.forEach(function(each) {
                    getMember(each._id).name = each.name;
                });
                if (handler) {
                    handler(communityMembers);
                }
            });
        }
        return {
            getMember: getMember,
            updateCommunityMembers: updateCommunityMembers
        }
    });