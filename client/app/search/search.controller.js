'use strict';

angular.module('kf6App')
    .controller('SearchCtrl', function($scope, $http, $community, $stateParams, $kfutil) {
        var communityId = $stateParams.communityId;
        $community.enter(communityId);

        $kfutil.mixIn($scope);

        $scope.query = '';
        $scope.communityMembers = [];
        $scope.isCollapsed = true;
        $scope.selectedAuthor = '';
        $scope.contributions = [];

        $scope.communityMembers = $community.getMembersArray();
        $community.updateCommunityMembers();

        $scope.search = function() {
            var query = {
                communityId: communityId,
                words: [],
                authors: []
            };
            var tokens = $scope.query.split(' ');
            tokens.forEach(function(token) {
                if (token.length === 0) {
                    return;
                }
                if (token.indexOf('-from:') >= 0) {
                    token = token.replace('-from:', '');
                    query.from = token;
                    return;
                }
                if (token.indexOf('-to:') >= 0) {
                    token = token.replace('-to:', '');
                    query.to = token;
                    return;
                }
                if (token.indexOf('-author:') >= 0) {
                    token = token.replace('-author:', '');
                    var author = _.findWhere($scope.communityMembers, {
                        email: token
                    });
                    if (author) {
                        query.authors.push(author._id);
                    } else {
                        window.alert('author:' + token + ' not found');
                    }
                    return;
                }
                query.words.push(token);
            });
            $http.post('/api/contributions/search', {
                query: query
            }).success(function(contributions) {
                $scope.contributions = contributions;
            });
        };

        $scope.openFrom = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.fromOpened = true;
        };

        $scope.openTo = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.toOpened = true;
        };

        $scope.$watch('from', function() {
            if ($scope.from !== undefined) {
                $scope.query += ' -from:' + $scope.from.toISOString();
            }
        });
        $scope.$watch('to', function() {
            if ($scope.to !== undefined) {
                $scope.query += ' -to:' + $scope.to.toISOString();
            }
        });

        $scope.addAuthor = function() {
            $scope.query += ' -author:' + $scope.selectedAuthor;
        };

    });