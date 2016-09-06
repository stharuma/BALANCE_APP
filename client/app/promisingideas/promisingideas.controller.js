'use strict';

angular.module('kf6App')
    .controller('PromisingIdeasCtrl', function ($scope, $http, $community, $stateParams, $ac, $suresh) {
        var communityId = $stateParams.communityId;
        $community.enter(communityId, function () {
           $scope.search();
        });
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
        $scope.status.noPromisingCollapsed = true;
        $scope.show = true;
        $scope.status.communityCollapsed = true;
        $scope.status.status = 'init';
        $scope.labels = [];
        $scope.promisngNotes = [];
        $scope.colors = [];
        $scope.selectedColor = '';
        $scope.status.isnewNoteCollapsed = true;
        //export to CSV
        $scope.tableData = [];
        $scope.selectedPromisingIdeas = [];
        $scope.promisingnoteTitle = '';
        $scope.selectedViewIds = [];

        $scope.pager = {};

        $scope.getHeader = function () {
            return ['Color', 'PromisingIIdeas', 'Reason', 'In ContributionTitle', 'Weight/s'];
        };

        var checkedPromisingtLinkInNote = function (notes) {
            intilize(notes);
            notes.forEach(function (note, index) {
                var promisingnotefound = true;
                $http.get('/api/links/to/' + note._id).success(function (links) {
                    links.forEach(function (link) {
                        if (link.type === 'promisings') {
                            $community.getObject(link.from, function (promisingIdeaobj) {
                                if (promisingIdeaobj.data.color === '') {
                                    promisingIdeaobj.data.color = 'None';
                                }
                                $scope.tableData.push({
                                    color: promisingIdeaobj.data.color,
                                    promisingidea: promisingIdeaobj.data.idea,
                                    reason: promisingIdeaobj.data.reason,
                                    inContributionTitle: note.title
                                });

                                if (!contains($scope.colors, promisingIdeaobj.data.color)) {
                                    if (promisingIdeaobj.data.color === '') {
                                        $scope.colors.push('None');
                                    } else {
                                        $scope.colors.push(promisingIdeaobj.data.color);
                                    }
                                }
                            });
                            if (promisingnotefound === true) {
                                $scope.promisngNotes.push(note);
                                promisingnotefound = false;
                            }
                            $scope.status.detailCollapsed = false;
                        }

                    });
                    setNopromising(index, notes);

                });

            });

            $scope.selectedColor = $scope.colors[0];
        };

        function setNopromising(index, notes) {
            if (index === notes.length - 1) {
                if ($scope.promisngNotes.length === 0) {
                    $scope.status.noPromisingCollapsed = false;
                }
            }
        }

        function setpromisingoverlappedcounted() {
            $scope.tableData.forEach(function (promising, index, data) {
                counted(promising, index, data);
            });
        }

        function counted(promising, idx, data) {
            var hit = 1;
            $scope.tableData.forEach(function (promising_, index) {
                if (promising_.promisingidea.length <= promising.promisingidea.length) {
                    if (promising.promisingidea.indexOf(promising_.promisingidea) !== -1 && index !== idx) {
                        hit++;
                    }

                }
            });
            if (hit === 1) {
                hit = '< ' + hit + ' Weight>';
            } else {
                hit = '< ' + hit + ' Weights>';
            }
            data[idx].count = hit;
        }

        $scope.toggleSelection = function toggleSelection(promising) {
            var idx = $scope.selectedPromisingIdeas.indexOf(promising + '<br />');
            // is currently selected
            if (idx > -1) {
                $scope.selectedPromisingIdeas.splice(idx, 1);
            }
            // is newly selected
            else {
                $scope.selectedPromisingIdeas.push(promising + '<br />');
            }
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
            setpromisingoverlappedcounted();
            if ($scope.selectedColor !== $scope.colors[0]) {
                $scope.tableData.forEach(function (promising) {
                    if (note.title === promising.inContributionTitle) {
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
            if ($scope.status.isnewNoteCollapsed) {
                $scope.viewTitlescopy = '';
                $scope.viewTitles.push(view.title);
                $scope.queryString += ' -view:' + view._id;
                $scope.status.detailCollapsed = true;
            } else {
                $scope.selectedViewIds.push(view._id);
            }
        };


        //Pager Status
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
            $scope.pager.query = $suresh.makeQuery($scope.queryString, communityId, $scope.communityMembers, $community);
            $suresh.count($scope.status, $scope.pager, communityId, $ac, $http, checkedPromisingtLinkInNote);
            $scope.queryString = '';
        };

        $scope.getIcon = function (contribution) {
            if ($community.amIAuthor(contribution)) {
                return 'manual_assets/kf4images/icon-note-unknown-auth-.gif';
            } else {
                return 'manual_assets/kf4images/icon-note-unknown-othr-.gif';
            }
        };

        $scope.makepromisingnote = function (title, body) {
            if (title === '') {
                window.alert('Note title is empty ');
                return;
            }
            if ($scope.selectedViewIds.length === 0) {
                window.alert('View is not selected');
                return;
            }
            $suresh.createnewnoteInMutipleView(title, $scope.selectedViewIds, $community, body, $http);
            $scope.selectedViewIds.length = 0;
            $scope.status.isnewNoteCollapsed = true;


        };

    });
