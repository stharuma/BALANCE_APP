'use strict';

angular.module('kf6App')
    .controller('IdeaGrowthCtrl', function ($scope, $http, $community, $stateParams, $suresh, $ac) {
        var communityId = $stateParams.communityId;

        //Query String
        $scope.queryString = '';
        $scope.currentCommunity = {};
        //General Status
        $scope.status = {};
        $scope.status.detailCollapsed = false;
        $scope.status.barchartCollapsed = true;
        $scope.status.detailsCollapsed = true;
        $scope.status.status = 'init';
        $scope.contributions = [];
        $scope.labels = [];
        $scope.notewordInfo = [];
        $scope.weeksdate = [];
        $scope.selectedItems = [];
        $scope.uniwords = [];
        $scope.curcommonwords = [];
        $scope.uncommonwords = [];
        $scope.current = '';
        $scope.currentselected = {
            name: 'Weekly'
        };
        var wcountincommunity = [];
        var uniwcountincommunity = [];
        var totaluniwords = [];
        var wordsInfo = [];
        var uniwordsInfo = [];
        var commonwordsInfo = [];
        var uncommonwordsInfo = [];
        var wordsInfoInCommunity = [];
        var uniwordsInfoInCommunity = [];
        var commonwordsInfoInCommunity = [];
        var uncommonwordsInfoInCommunity = [];
        var startdate = '';
        var enddate = '';
        var weeklydates = [];
        var biweeklydates = [];

        var commonwords = new Array();
        $.get('manual_assets/commonwords1-1000.txt', function (data) {
            commonwords = data.split('\n');
        });
        $community.enter(communityId, function () {
            $community.refreshMembers();
            $scope.communityMembers = $community.getCommunityData().membersArray;
            $scope.currentCommunity = $community.getCommunityData();
        });

        var checkedWordInNote = function (notes) {
            var body =[];
            intilize();
            notes.forEach(function (note) {
                body = note.text4search.toLowerCase().match(/\w+/g);
                body.splice(0, 1);
                setwords(commonwords, body, $scope.uncommonwords, true);
                setwords(totaluniwords, $scope.uncommonwords, $scope.uniwords, false);
                $scope.notewordInfo.push({
                    note: note,
                    created: new Date(note.created),
                    wordcount: body.length,
                    wordfreq: wordFrequency(body),
                    uniwordcount: $scope.uniwords.length,
                    uniwordfreq: wordFrequency($scope.uniwords),
                    uncommonwordcount:$scope.uncommonwords.length,
                    uncommonwordfreq: wordFrequency($scope.uncommonwords),
                    commonwordcount:$scope.curcommonwords.length,
                    commonwordfreq: wordFrequency($scope.curcommonwords)

                });
                if ($scope.queryString === '') {
                     wordsInfoInCommunity.push(
                     { note: note,
                       words: body
                     });
                     totaluniwords.push($scope.uniwords);
                    uniwordsInfoInCommunity.push(
                     { note: note,
                       uniwords: $scope.uniwords
                     });
                    commonwordsInfoInCommunity.push(
                     { note: note,
                       commonwords: $scope.commonwords
                     });
                    uncommonwordsInfoInCommunity.push(
                     { note: note,
                       uncommonwords: $scope.uncommonwords
                     });
                } else {
                    wordsInfo.push(
                     { note: note,
                       words: body
                     });
                    addnotduplicatevaluesInarray(totaluniwords,$scope.uniwords)
                    //totaluniwords.push($scope.uniwords);
                    console.log(totaluniwords.toString());
                    uniwordsInfo.push(
                     { note: note,
                       uniwords: $scope.uniwords
                     });
                    commonwordsInfo.push(
                     { note: note,
                       commonwords: $scope.commonwords
                     });
                    uncommonwordsInfo.push(
                     { note: note,
                       uncommonwords: $scope.uncommonwords
                     });
                }
            });
        };

        var setwords = function (commonwords, words, curwords, hasCommonwords ) {
            curwords.length = 0;
            if(hasCommonwords){
               $scope.curcommonwords.length=0;
            }   
            words.forEach(function (eachword) {// console.log('each: '+eachword);
                if (commonwords.toString().indexOf(eachword) === -1) {
                    curwords.push(eachword);
                }else{
                    if(hasCommonwords){
                      // $scope.curcommonwords.length=0;
                       $scope.curcommonwords.push(eachword);
                    }
                }
            });
        };

        $scope.getCreated = function (created) {
                return new Date(created).toLocaleString();
          };

        function addnotduplicatevaluesInarray(a,b){
            b.forEach(function(value){
              if (a.indexOf(value)==-1) a.push(value);
            });
        }    

        function intilize() {
            $scope.notewordInfo.length = 0;
            wordsInfo.length = 0;
            totaluniwords.length = 0;
            uniwordsInfo.length = 0;
            commonwordsInfo.length=0;
            uncommonwordsInfo.length=0;
            wordsInfoInCommunity.length = 0;
            uniwordsInfoInCommunity.length = 0;
            commonwordsInfoInCommunity.length=0;
            uncommonwordsInfoInCommunity.length=0;
            setweekdates();
            $scope.progressselection();
        }

        function strip(html) {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return (tmp.textContent || tmp.innerText || "");
        }


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
            var tdata = $scope.gettermdata($scope.weeksdate, $scope.notewordInfo);
            var sample1 = [];
            var sample2 = [];

            tdata.forEach(function (d) {
              //  console.log('d.date, d.twordcount' + d.date + '   ' + d.twordcount);
                sample1.push([d.date, d.twordcount]);
                sample2.push([d.date, d.tuniwordcount]);

            });

            $scope.options = {
            chart: {
                type: 'linePlusBarChart',
                height: 500,
                margin: {
                    top: 30,
                    right: 75,
                    bottom: 50,
                    left: 75
                },
                bars: {
                    forceY: [0]
                },
                bars2: {
                    forceY: [0]
                },
                color: ['#2ca02c', 'darkred'],
                x: function(d,i) { return i },
                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d) {
                        var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                        if (dx > 0) {
                            return d3.time.format('%x')(new Date(dx))
                        }
                        return null;
                    }
                },
                x2Axis: {
                    tickFormat: function(d) {
                        var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                        return d3.time.format('%b-%Y')(new Date(dx))
                    },
                    showMaxMin: false
                },
                y1Axis: {
                    axisLabel: 'Y1 Axis',
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    },
                    axisLabelDistance: 12
                },
                y2Axis: {
                    axisLabel: 'Y2 Axis',
                    tickFormat: function(d) {
                        return d3.format(',.2f')(d)
                    }
                },
                y3Axis: {
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    }
                },
                y4Axis: {
                    tickFormat: function(d) {
                        return d3.format(',.2f')(d)
                    }
                }
            }
        };

        $scope.data = [
            {
                "key" : "Total word" ,
                "bar": true,
                "values" : sample1
            },
            {
                "key" : "Unique Word" ,
                "values" : sample2
            }

        ].map(function(series) {
                series.values = series.values.map(function(d) { return {x: d[0], y: d[1] } });
                return series;
            });
        };

        $scope.detailsControl = function () {
            $suresh.detailsControl($scope.status);
        };
        //results
        $scope.search = function () {
            $suresh.searchprocess($scope.queryString, communityId, $scope.communityMembers, $community, $scope.status, checkedWordInNote);
            $scope.status.detailCollapsed = true;
            $scope.detailsControl();
        };

        $scope.getIcon = function (contribution) {
            if ($community.amIAuthor(contribution)) {
                return 'manual_assets/kf4images/icon-note-unknown-auth-.gif';
            } else {
                return 'manual_assets/kf4images/icon-note-unknown-othr-.gif';
            }
        };

        function wordFrequency(wordarr) {
            var freqMap = {};
            wordarr.forEach(function (w) {
                if (!freqMap[w]) {
                    freqMap[w] = 0;
                }
                freqMap[w] += 1;
            });
            return freqMap;
        }
               
        function treatAsUTC(date) {
            var result = new Date(date);
            result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
            return result;
        }

        function daysBetween(startDate, endDate) {
            var millisecondsPerDay = 24 * 60 * 60 * 1000;
            return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
        }

        function weeksBetween(startDate, endDate) {
            return daysBetween(startDate, endDate) / 7 | 0;
        }

        function biweeksBetween(startDate, endDate) {
            return daysBetween(startDate, endDate) / 14 | 0;
        }

        function weeksdates(startDate, numofweeks, numofdays) {
            var weeks = [];
            var millisecondsPerDay = 24 * 60 * 60 * 1000;
            var weekcount = startDate.getTime();
            weeks.push({
                weekdate: 'All'
            });
                       for (var i = 0; i < numofweeks; i++) {
                weekcount += millisecondsPerDay * numofdays;
                weeks.push({
                    weekdate: new Date(weekcount)
                });
            };
            return weeks;
        }

        function setweekdates() { //$scope.weeksdate.length=0; console.log('test');
            $scope.selectedItems.forEach(function (item) {
                if (item.fromDate !== undefined) {
                    startdate = new Date(item.fromDate);
                }
                if (item.toDate !== undefined) {
                    enddate = new Date(item.toDate);
                }

            });
            if (startdate !== '') {
                //  var days = daysBetween(startdate, enddate);
                var weeks = weeksBetween(startdate, enddate);
                var biweeks = biweeksBetween(startdate, enddate);

                weeklydates = weeksdates(startdate, weeks, 7);
                biweeklydates = weeksdates(startdate, biweeks, 14);

            }

        };

        $scope.progressselection = function () { //$scope.weeksdate.length=0; console.log('test');
            if ($scope.currentselected.name === 'Weekly') {
                $scope.weeksdate = weeklydates;
            } else {
                $scope.weeksdate = biweeklydates;
            }
            $scope.current = $scope.weeksdate[0];
             return $scope.currentselected.name;
        };


        $scope.gettermdata = function (dates, notewordInfo) { //$scope.weeksdate.length=0; console.log('test');
            var wdata = [];
            dates.splice(0, 1);
            dates.forEach(function (date1) {
                var totalwcount = 0;
                var totalucount = 0;
                notewordInfo.forEach(function (wordinfo) {
                    if (date1.weekdate.getTime() >= wordinfo.created.getTime()) {
                        totalwcount += wordinfo.wordcount;
                        totalucount += wordinfo.uniwordcount;
                    }
                });
                wdata.push({
                    date: date1.weekdate.getTime(),
                    twordcount: totalwcount,
                    tuniwordcount: totalucount
                });
            });
            return wdata;
        };

    });
