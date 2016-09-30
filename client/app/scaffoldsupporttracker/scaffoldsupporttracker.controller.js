'use strict';

angular.module('kf6App')
    .controller('ScaffoldsupporttrackerCtrl', function ($scope, $http, $community, $stateParams, $suresh, $ac) {
        var communityId = $stateParams.communityId;
        $scope.currentCommunity = {};
        if (communityId) {
            $community.enter(communityId, function () {}, function () {
                $community.refreshMembers();
                $scope.currentCommunity = $community.getCommunityData();
                $scope.communityMembers = $community.getCommunityData().membersArray;
                $scope.scaffolds = $community.getCommunityData().registeredScaffolds;
                $community.refreshRegisteredScaffolds(function () {
                    $scope.current = $scope.scaffolds[0];
                    $scope.scaffolds.forEach(function (scaffold) {
                        (scaffold.supports).forEach(function (support) {
                            $scope.selectedSupports.push(support);
                        });
                    });
                    $scope.search();
                });
            });
        }
        //Query String
        $scope.queryString = '';


        //General Status
        $scope.contributions = [];
        $scope.status = {};
        $scope.status.detailCollapsed = true;
        $scope.status.barchartCollapsed = true;
        $scope.status.radarchartCollapsed = true;
        $scope.status.detailsCollapsed = true;
        $scope.status.status = 'init';
        $scope.selectedSupports = [];
        $scope.labels = [];
        $scope.supportsCountInNote = [];
        $scope.count = [];
        $scope.data = [$scope.count];
        $scope.selectedItems = [];

        // toggle selection for a given support Item by title
        $scope.toggleSelection = function toggleSelection(support) {
            var idx = $scope.selectedSupports.indexOf(support);
            // is currently selected
            if (idx > -1) {
                $scope.selectedSupports.splice(idx, 1);
            }
            // is newly selected
            else {
                $scope.selectedSupports.push(support);
            }
        };

        //export to CSV
        $scope.tableData = [];
        $scope.getHeader = function () {
            return ['Support', 'Frequency', 'In Contribution'];
        };

        var checkedSupportLinkInNote = function (notes) {
            $scope.supportsCountInNote.length = 0;
            $scope.tableData.length = 0;
            notes.forEach(function (note, index) {
                var supportfound = false;
                $http.get('/api/links/to/' + note._id).success(function (links) {
                    $scope.selectedSupports.forEach(function (support) {
                        var linkCount = 0;
                        links.forEach(function (link) {
                            if (support.to === link.from) {
                                linkCount++;
                            }
                        });
                        if (linkCount !== 0) {
                            supportfound = true;
                            $scope.supportsCountInNote.push({
                                note: note,
                                supportTitle: support._to.title,
                                count: linkCount
                            });
                        }
                    });
                    if (index === notes.length - 1) {
                        $scope.addCoordinateData();
                    }
                });

            });

        };
        $scope.addCoordinateData = function () {
            $scope.count.length = 0;
            $scope.labels.length = 0;
            $scope.selectedSupports.forEach(function (support, index) {
                var maxcount = 0;
                var frequencyDetails = '  ';
                $scope.supportsCountInNote.forEach(function (item) {
                    if (support._to.title === item.supportTitle) {
                        maxcount += item.count;
                        frequencyDetails += item.note.title + ' -- ' + item.count + ', ';
                    }
                });
                $scope.tableData.push({
                    supportTitle: support._to.title,
                    frequency: maxcount,
                    inContribution: frequencyDetails
                });

                if (index === $scope.selectedSupports.length - 1) {console.log('here');
                    $scope.tableData.sort(function (a, b) {
                        return parseInt(a.frequency, 10) - parseInt(b.frequency, 10);
                    }).reverse();
                   $scope.tableData.forEach(function (data) {
                        $scope.count.push(data.frequency);
                        $scope.labels.push(data.supportTitle);
                   });
                }

            });
        };

        $scope.setSelectedData = function (queryString, selectedItems, views, authors, todate, fromdate) {
            $scope.selectedItems = selectedItems;
            $scope.queryString = queryString;
            $scope.views = views;
            $scope.authors = authors;
            $scope.todate = todate;
            $scope.fromdate = fromdate;
        };

        $scope.barchartControl = function () {
            $suresh.barchartControl($scope.status);
        };
        $scope.radarchartControl = function () {
            $suresh.radarchartControl($scope.status);
        };
        $scope.detailsControl = function () {
            $suresh.detailsControl($scope.status);
        };
        // $scope.getIcon = function(contribution) {$suresh.getIcon(contribution, $community); };


        //Pager Status
        $scope.pager = {};
        $scope.pager.getStart = function () {
            return (($scope.pager.page - 1) * $scope.pager.pagesize) + 1;
        };
        $scope.pager.getEnd = function () {
            var end = $scope.pager.getStart() + $scope.pager.pagesize - 1;
            if (end > $scope.pager.total) {
                end = $scope.pager.total;
            }
            return end;
        };
        $scope.pager.pagesize = 50;

        //results
        $scope.search = function () {
            if ($scope.selectedSupports.length === 0) {
                window.alert('Select Support Items:');
            } else {
                $scope.pager.query = $suresh.makeQuery($scope.queryString, communityId, $scope.communityMembers, $community);
                $suresh.count($scope.status, $scope.pager, communityId, $ac, $http, checkedSupportLinkInNote);
                $scope.status.detailCollapsed = true;
                $scope.detailsControl();
            }
        };

        $scope.getIcon = function (contribution) {
            if ($community.amIAuthor(contribution)) {
                return 'manual_assets/kf4images/icon-note-unknown-auth-.gif';
            } else {
                return 'manual_assets/kf4images/icon-note-unknown-othr-.gif';
            }
        };

    });
