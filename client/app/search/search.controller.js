'use strict';

angular.module('kf6App')
    .controller('SearchCtrl', function($scope, $http, $community, $stateParams, $kfutil, $ac) {
        var communityId = $stateParams.communityId;
        $community.enter(communityId);
        $community.refreshMembers();
        $community.refreshViews(function() {
            $scope.views = $community.getViews();
        });
        $scope.communityMembers = $community.getCommunityData().membersArray;

        $kfutil.mixIn($scope);

        //Query String
        $scope.queryString = '';
        $scope.selected = {}; //currently using only for views
        $scope.selected.views = [];

        //General Status
        $scope.status = {};
        $scope.status.detailCollapsed = true;
        $scope.status.status = 'init';

        //Pager Status
        $scope.pager = {};
        $scope.pager.getStart = function() {
            return (($scope.pager.page - 1) * $scope.pager.pagesize) + 1;
        };
        $scope.pager.getEnd = function() {
            var end = $scope.pager.getStart() + $scope.pager.pagesize - 1;
            if (end > $scope.pager.total) {
                end = $scope.pager.total;
            }
            return end;
        };
        $scope.pager.pagesize = 50;

        //results
        $scope.contributions = [];

        $scope.search = function() {
            $scope.pager.query = makeQuery($scope.queryString);
            $scope.status.detailCollapsed = true;
            count();
        };

        $scope.pageChanged = function() {
            openPage();
        };

        function count() {
            $scope.status.status = 'searching';
            $http.post('/api/contributions/' + communityId + '/search/count', {
                query: $scope.pager.query
            }).success(function(result) {
                $scope.pager.total = result.count;
                $scope.pager.page = 1;
                openPage();
            }).error(function() {
                $scope.status.status = 'error';
            });
        }

        function openPage() {
            $scope.status.status = 'searching';
            $scope.pager.query.pagesize = $scope.pager.pagesize;
            $scope.pager.query.page = $scope.pager.page;
            $http.post('/api/contributions/' + communityId + '/search', {
                query: $scope.pager.query
            }).success(function(contributions) {
                contributions.forEach(function(c) {
                    if (!$ac.isReadable(c)) {
                        c.title = 'forbidden';
                        c.authors = [];
                        c.data.body = '(forbidden)';
                        c.created = null;
                    }
                });
                $scope.contributions = contributions;
                if (contributions.length > 0) {
                    $scope.status.status = 'searched';
                } else {
                    $scope.status.status = 'noresult';
                }
            }).error(function() {
                $scope.status.status = 'error';
            });
        }

        function makeQuery(queryString) {
            var query = {
                communityId: communityId,
                words: [],
                authors: []
            };
            var tokens = queryString.split(' ');
            tokens.forEach(function(token) {
                if (token.length === 0) {
                    return;
                }

                if (token.indexOf('-private') >= 0) {
                    query.privateMode = $community.getAuthor()._id;
                    return;
                }

                if (token.indexOf('-view:') >= 0) {
                    token = token.replace('-view:', '');
                    if (!query.viewIds) {
                        query.viewIds = [];
                    }
                    query.viewIds.push(token);
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
                        userName: token
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
            return query;
        }

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
                $scope.queryString += ' -from:' + $scope.from.toISOString();
            }
        });
        $scope.$watch('to', function() {
            if ($scope.to !== undefined) {
                $scope.queryString += ' -to:' + $scope.to.toISOString();
            }
        });

        $scope.addViews = function() {
            if ($scope.selected.views && $scope.selected.views.length >= 1) {
                $scope.selected.views.forEach(function(each) {
                    $scope.queryString += ' -view:' + each._id;
                });
                $scope.selected.views = [];
            }
        };

        $scope.addPrivateMode = function() {
            $scope.queryString += ' -private';
        };

        $scope.authorSelected = function(author) {
            $scope.queryString += ' -author:' + author.userName;
        };

        $scope.makeAuthorString = function(obj) {
            return $community.makeAuthorStringByIds(obj.authors);
        };

    });