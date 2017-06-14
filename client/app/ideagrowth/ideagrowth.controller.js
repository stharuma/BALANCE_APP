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
        $scope.current = '';
        $scope.currentselected = {
            name: 'Weekly'
        };
        var wcountincommunity = [];
        var uniwcountincommunity = [];
        var wcount = [];
        var uniwcount = [];
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
            $scope.notewordInfo.length = 0;
            wcount.length = 0;
            uniwcount.length = 0;
            setweekdates();
            $scope.progressselection();
            notes.forEach(function (note) {
                body = note.text4search.toLowerCase().match(/\w+/g);
                body.splice(0, 1);
             //     var body = strip(note.data.body.replace(/&nbsp;|(<([^>]+)>)/ig, ' ')).replace(/[\(\)\+\.,\/#!$%\^&\*{}=_`~]/g, '');
             //    body = body.replace(/[\r\n\t\u00A0\u3000]/g, ' ').replace(/['"]+/g, '').replace(/\s\s+/g, ' ').replace(/&nbsp;|(<([^>]+)>)/ig, ' ');
             //     body = body.toLowerCase().split(' ');
             // console.log('body :'+body);
                setuniquewords(commonwords, body);
                $scope.notewordInfo.push({
                    note: note,
                    created: new Date(note.created),
                    wordcount: body.length,
                    wordfreq: wordFrequency(body),
                    uniwordcount: $scope.uniwords.length,
                    uniwordfreq: wordFrequency($scope.uniwords)
                });
                if ($scope.queryString === '') {
                    wcountincommunity.push(body.length);
                    uniwcountincommunity.push($scope.uniwords.length);
                } else {
                    wcount.push(body.length);
                    uniwcount.push($scope.uniwords.length);
                }
            });
        };

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
            // var tdata = $scope.gettermdata($scope.weeksdate, $scope.notewordInfo);
            // var sample1 = [];
            // var sample2 = [];

            // tdata.forEach(function (d) {
            //   //  console.log('d.date, d.twordcount' + d.date + '   ' + d.twordcount);
            //     sample1.push([d.date, d.twordcount]);
            //     sample2.push([d.date, d.tuniwordcount]);

            // });


            // $scope.options = {
            //     chart: {
            //         type: 'lineChart',
            //         height: 450,
            //         margin: {
            //             top: 20,
            //             right: 20,
            //             bottom: 60,
            //             left: 65
            //         },
            //         x: function (d) {
            //             return d[0];
            //         },
            //         y: function (d) {
            //             return d[1];
            //         },


            //         color: d3.scale.category10().range(),
            //         duration: 300,
            //         useInteractiveGuideline: true,
            //                            clipVoronoi: false,

            //         xAxis: {
            //             axisLabel: 'X Axis',
            //             tickFormat: function (d) {
            //                return d3.time.format('%x')(new Date(d))
            //                // return d
            //             },
            //             showMaxMin: false,
            //             staggerLabels: true
            //         },

            //         yAxis: {
            //             axisLabel: 'Y Axis',
            //                                   tickFormat: function (d) {
            //                 return d;
            //             },
            //             axisLabelDistance: 20
            //         }

            //         }
            // };
            // $scope.data = [
            //     {
            //         key: "Word count",
            //         values: sample1
            //   },

            //     {
            //         key: "Unique word count",
            //         values: sample2
            //          }
            //       ];
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

        var setuniquewords = function (commonwords, words) {
            $scope.uniwords.length = 0;
            words.forEach(function (eachword) {// console.log('each: '+eachword);
              commonwords.forEach(function (cword) { //console.log('each: '+cword);
                 });

                if (commonwords.toString().indexOf(eachword) === -1) {
                    $scope.uniwords.push(eachword);
                }
            });
        };

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
