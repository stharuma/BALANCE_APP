'use strict';

angular.module('kf6App')
    .factory('$suresh', function () {
        var obj = {};

        obj.makeQuery = function (queryString, communityId, communityMembers, $community) {
            var query = {
                communityId: communityId,
                words: [],
                authors: []
            };
            var tokens = queryString.split(' ');
            tokens.forEach(function (token) {
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
                    var author = _.findWhere(communityMembers, {
                        userName: token
                    });
                    if (author) {
                        query.authors.push(author._id);
                    } else {
                        window.alert('author:' + token + ' not found');
                    }
                    return;
                }
                if (token.indexOf('-searchMode:') >= 0) {
                    token = token.replace('-searchMode:', '');
                    query.searchMode = token;
                    return;
                }
                if (token.indexOf('-type:') >= 0) {
                    token = token.replace('-type:', '');
                    query.type = token;
                    return;
                }
                query.words.push(token);
            });
            return query;
        };

        obj.detailsControl = function (status) {
            status.detailsCollapsed = false;
            if (!status.radarchartCollapsed) {
                status.radarchartCollapsed = true;
            }
            if (!status.barchartCollapsed) {
                status.barchartCollapsed = true;
            }
        };

        obj.radarchartControl = function (status) {
            status.radarchartCollapsed = !status.radarchartCollapsed;
            if (!status.detailsCollapsed) {
                status.detailsCollapsed = true;
            }
            if (!status.barchartCollapsed) {
                status.barchartCollapsed = true;
            }
        };

        obj.barchartControl = function (status) {
            status.barchartCollapsed = !status.barchartCollapsed;
            if (!status.radarchartCollapsed) {
                status.radarchartCollapsed = true;
            }
            if (!status.detailsCollapsed) {
                status.detailsCollapsed = true;
            }
        };

        obj.count = function (status, pager, communityId, $ac, $http, getContributions) {
            status.status = 'searching';
            $http.post('/api/contributions/' + communityId + '/search/count', {
                query: pager.query
            }).success(function (result) {
                pager.total = result.count;
                pager.page = 1;
                openPage(status, pager, communityId, $ac, $http, getContributions);
                //  alert(notes.length);
            }).error(function () {
                status.status = 'error';
            });
        };

        function openPage(status, pager, communityId, $ac, $http, getContributions) {
            status.status = 'searching';
            pager.query.pagesize = pager.pagesize;
            pager.query.page = pager.page;
            $http.post('/api/contributions/' + communityId + '/search', {
                query: pager.query
            }).success(function (contributions) {
                contributions.forEach(function (c) {
                    if (!$ac.isReadable(c)) {
                        c.title = 'forbidden';
                        c.authors = [];
                        c.data.body = '(forbidden)';
                        c.created = null;
                    }
                });
                if (contributions.length > 0) {
                    status.status = 'searched';
                } else {
                    status.status = 'noresult';
                }
                getContributions(contributions);
            }).error(function () {
                status.status = 'error';
            });
        }

        obj.getIcon = function (contribution, $community) {
            if ($community.amIAuthor(contribution)) {
                return 'manual_assets/kf4images/icon-note-unknown-auth-.gif';
            } else {
                return 'manual_assets/kf4images/icon-note-unknown-othr-.gif';
            }
        };

        return obj;
    });
