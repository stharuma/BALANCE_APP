'use strict';

angular.module('kf6App')
    .controller('ScaffoldsupporttrackerCtrl', function ($scope, $http, $community, $stateParams, $kfshared, $ac) {
        var communityId = $stateParams.communityId;
        if ( communityId) {
            $community.enter( communityId, function() {}, function() {
                $community.refreshRegisteredScaffolds();
           });
        }
        $community.refreshMembers();
        $scope.communityMembers = $community.getCommunityData().membersArray;
        $scope.scaffolds = $community.getCommunityData().registeredScaffolds;
        $community.refreshRegisteredScaffolds(function () {
            $scope.current = $scope.scaffolds[0];
        });
        $scope.currentCommunity = {};
        $scope.currentCommunity = $community.getCommunityData();
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
            $scope.selectedSupports.forEach(function (support) {
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
                $scope.count.push(maxcount);
                $scope.labels.push(support._to.title);
            });
        };

        $scope.setSelectedData = function (queryString, selectedItems) {
            $scope.selectedItems = selectedItems;
            $scope.queryString = queryString;
        };

        $scope.barchartControl = function () {
            $kfshared.barchartControl($scope.status);
        };
        $scope.radarchartControl = function () {
            $kfshared.radarchartControl($scope.status);
        };
        $scope.detailsControl = function () {
            $kfshared.detailsControl($scope.status);
        };
        // $scope.getIcon = function(contribution) {$kfshared.getIcon(contribution, $community); };


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
                $scope.pager.query = $kfshared.makeQuery($scope.queryString, communityId, $scope.communityMembers, $community);
                $kfshared.count($scope.status, $scope.pager, communityId, $ac, $http, checkedSupportLinkInNote);
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
