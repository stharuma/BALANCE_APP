'use strict';

angular.module('kf6App')
    .controller('LexicalAnalysisCtrl', function ($scope, $http, $community, $stateParams, $suresh, $ac) {
        var communityId = $stateParams.communityId;
        $community.enter(communityId);
        $community.refreshMembers();
        $scope.communityMembers = $community.getCommunityData().membersArray;
        $scope.currentCommunity = {};
        $scope.currentCommunity = $community.getCommunityData();
        //Query String
        $scope.queryString = '';
        $scope.textareaText = '';

        //General Status
        $scope.contributions = [];
        $scope.status = {};
        $scope.status.detailCollapsed = true;
        $scope.status.barchartCollapsed = true;
        $scope.status.radarchartCollapsed = true;
        $scope.status.detailsCollapsed = true;
        $scope.status.status = 'init';
        $scope.labels = [];
        $scope.lexiconsInfo = [];
        $scope.count = [];
        $scope.data = [$scope.count];
        $scope.selectedItems = [];
        $scope.lexicons = [];


        //export to CSV
        $scope.getHeader = function () {
            return ['Lexicon', 'Frequency', 'In Contribution'];
        };

        var checkedWordInNote = function (notes) {
            $scope.lexiconsInfo.length = 0;
            var lexiconCountInnote = 0;
            $scope.textareaText=$scope.textareaText.replace(/[\(\)\+\.,\/#!$%\^&\*{}=_`~]/g, '').replace(/[\r\n\t\u00A0\u3000]/g, ' ');
            $scope.lexicons = $scope.textareaText.replace(/\s\s+/g, ' ').replace(/['"]+/g, '').toLowerCase().split(' '); //processedText.split(' ');
            $scope.lexicons = uniqBy($scope.lexicons, JSON.stringify);

            notes.forEach(function (note) {
                var body = note.text4search.toLowerCase().replace(/[\(\)\+\.,\/#!$%\^&\*{}=_`~]/g, '');
                body = body.replace(/[\r\n\t\u00A0\u3000]/g, ' ').replace(/['"]+/g, '').replace(/\s\s+/g, ' ').replace(/&nbsp;|(<([^>]+)>)/ig,' ');
                body = body.split(' ');
                body.splice(1,1);

                $scope.lexicons.forEach(function (lexicon) {
                    lexiconCountInnote = 0;
                    body.forEach(function (eachword) {
                        if (eachword === lexicon) {
                            lexiconCountInnote++;
                        }
                    });
                    if (lexiconCountInnote !== 0) {
                        $scope.lexiconsInfo.push({
                            note: note,
                            word: lexicon,
                            count: lexiconCountInnote
                        });
                    }
                });
            });
            $scope.addCoordinateData();
        };

        function uniqBy(a, key) {
            var seen = {};
            return a.filter(function (item) {
                var k = key(item);
                return seen.hasOwnProperty(k) ? false : (seen[k] = true);
            });
        }

        $scope.addCoordinateData = function () {
            $scope.count.length = 0;
            $scope.labels.length = 0;
            $scope.lexicons.forEach(function (word, index) {
                var maxcount = 0;
                var frequencyDetails = ' ';
                $scope.lexiconsInfo.forEach(function (item) {
                    if (word === item.word) {
                        maxcount += item.count;
                        frequencyDetails += item.note.title + ' -- ' + item.count + ', ';
                    }
                });
                $scope.lexicons[index] = {
                    word: word,
                    maxcount: maxcount,
                    inContribution: frequencyDetails
                };

                if (index === $scope.lexicons.length - 1) {
                    $scope.lexicons.sort(function (a, b) {
                        return parseInt(a.maxcount, 10) - parseInt(b.maxcount, 10);
                    }).reverse();
                   $scope.lexicons.forEach(function (data) {
                        $scope.count.push(data.maxcount);
                        $scope.labels.push(data.word);
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
        //  $scope.getIcon = function(contribution) {$suresh.getIcon(contribution, $community); };

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
            if ($scope.textareaText.length === 0) {
                window.alert('Lexicon is  empty:');
            } else {
                $scope.pager.query = $suresh.makeQuery($scope.queryString, communityId, $scope.communityMembers, $community);
                $suresh.count($scope.status, $scope.pager, communityId, $ac, $http, checkedWordInNote);
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
