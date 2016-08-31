'use strict';

angular.module('kf6App')
    .controller('DashboardCtrl', function($scope, $stateParams, $http, $community) {

        var communityId = $stateParams.communityId;

        $community.enter(communityId);
        $community.refreshMembers();

        var communityData = $community.getCommunityData();
        var data = [];
        $http.post('api/records/search/' + communityId, {}).success(function(records) {
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
                records.forEach(function(record) {
                    if (record.type === 'read' || record.type === 'modified') {
                        var author = communityData.members[record.authorId];
                        var object = catalog[record.targetId];
                        if (!object) {
                            //console.error('object missing');
                            return;
                        }
                        var toAuthor = communityData.members[object.authors[0]];
                        var type = 'READ';
                        if (record.type === 'modified') {
                            type = 'MODIFY';
                        }
                        var aData = {
                            from: author.name,
                            type: type,
                            objectId: "xx",
                            to: toAuthor.name,
                            when: record.timestamp
                        };
                        data.push(aData);
                    }
                });
                method();
            });
        });

        var method = function() {

        };

    });
