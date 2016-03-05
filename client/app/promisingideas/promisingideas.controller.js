'use strict';

angular.module('kf6App')
    .controller('PromisingIdeasCtrl', function ($scope, $http, $community, $stateParams,  $ac,  $kfcommon) {
        var communityId = $stateParams.communityId;
        $community.enter(communityId);
        $community.refreshMembers();
        $scope.communityMembers = $community.getCommunityData().membersArray;
        $scope.currentCommunity = {};
        $scope.currentCommunity = $community.getCommunityData();

        $scope.queryString = '';
        $scope.viewTitlescopy = '';

        //General Status
        $scope.contributions = [];
        $scope.viewTitles = [];
        $scope.status = {};
        $scope.status.detailCollapsed = true;
        $scope.show = true;
        $scope.status.communityCollapsed = true;
        $scope.status.status = 'init';
        $scope.labels = [];
        $scope.promisngNotes = [];
        $scope.colors = [];
        $scope.selectedColor = '';
        //export to CSV
        $scope.tableData = [];
        $scope.getHeader = function () {
            return ['PromisingIIdeas', 'In Contribution'];
        };

        var checkedPromisingtLinkInNote = function (notes) {
            intilize(notes);
            notes.forEach(function (note) {
                var promisingnotefound = true;
                $http.get('/api/links/to/' + note._id).success(function (links) {
                    links.forEach(function (link) {
                        if (link.type === 'promisings') {
                            $scope.tableData.push({
                                promisingidea: link.data.idea,
                                color: link.data.color,
                                inContribution: note
                            });
                            if (!contains($scope.colors, link.data.color)) {
                                $scope.colors.push(link.data.color);
                            }
                            if (promisingnotefound === true) {
                                $scope.promisngNotes.push(note);
                                promisingnotefound = false;
                            }
                        }

                    });
                });

            });

            $scope.selectedColor = $scope.colors[0];
        };

        function contains(a, obj) {
            var i = a.length;
            while (i--) {
                if (a[i] === obj) {
                    return true;
                }
            }
            return false;
        }

        function intilize(notes) {
            $scope.contributions = notes;
            $scope.tableData.length = 0;
            $scope.promisngNotes.length = 0;
            $scope.colors.length = 0;
            $scope.colors.push('All');
        }

        $scope.hascolorinPromisingnote = function (note) {
            var hascolor = false;
            if ($scope.selectedColor !== $scope.colors[0]) {
                $scope.tableData.forEach(function (promising) {
                    if (note === promising.inContribution) {
                        if (promising.color === $scope.selectedColor) {
                            hascolor = true;
                            return;
                        }
                    }
                });
            } else {
                hascolor = true;
            }
            return hascolor;
        };

        $scope.viewSelected = function (view) {
            $scope.viewTitlescopy = '';
            $scope.viewTitles.push(view.title);
            $scope.queryString += ' -view:' + view._id;
            $scope.status.detailCollapsed = true;
        };


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
            $scope.viewTitlescopy = '';
            if ($scope.viewTitles.length !== 0) {
                $scope.viewTitles.forEach(function (title, index) {
                    $scope.viewTitlescopy += title;

                    if (index >= 0 && index !== $scope.viewTitles.length - 1) {
                        $scope.viewTitlescopy += ' , ';
                    }
                });

                $scope.viewTitles.length = 0;
                $scope.status.communityCollapsed = true;
            } else {
                $scope.status.communityCollapsed = false;
            }
            $scope.pager.query =  $kfcommon.makeQuery($scope.queryString, communityId, $scope.communityMembers, $community);
            $kfcommon.count($scope.status, $scope.pager, communityId, $ac, $http, checkedPromisingtLinkInNote);
            $scope.status.detailCollapsed = false;
            $scope.queryString = '';
        };

        $scope.getIcon = function (contribution) {
            if ($community.amIAuthor(contribution)) {
                return 'manual_assets/kf4images/icon-note-unknown-auth-.gif';
            } else {
                return 'manual_assets/kf4images/icon-note-unknown-othr-.gif';
            }
        };


    });
