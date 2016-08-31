'use strict';

/* global d3 */
/* global crossfilter */
/* global dc */

angular.module('kf6App')
    .controller('DashboardCtrl', function($scope, $stateParams, $http, $community) {

        var communityId = $stateParams.communityId;

        $community.enter(communityId);
        $community.refreshMembers();

        var communityData = $community.getCommunityData();
        var data = [];
        $http.post('api/records/search/' + communityId, {}).success(function(records) {
            var query = {
                communityId: communityId,
                pagesize: 100000
            };
            $http.post('/api/contributions/' + communityId + '/search', {
                query: query
            }).success(function(contributions) {
                var catalog = {};
                contributions.forEach(function(contribution) {
                    catalog[contribution._id] = contribution;
                });
                records.forEach(function(record) {
                    if (record.type === 'read' || record.type === 'modified') {
                        var author = communityData.members[record.authorId];
                        var object = catalog[record.targetId];
                        if (!object) {
                            //console.error('object missing');
                            return;
                        }
                        var toAuthor = communityData.members[object.authors[0]];
                        var type = 'READ';
                        if (record.type === 'modified') {
                            type = 'MODIFY';
                        }
                        var aData = {
                            from: author.name,
                            type: type,
                            title: object.title,
                            to: toAuthor.name,
                            when: record.timestamp
                        };
                        data.push(aData);
                    }
                });
                method(data);
            });
        });

        var method = function(data) {
            var ndx = crossfilter(data);
            //var all = ndx.groupAll();

            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;
            data.forEach(function(d) {
                d.date = parseDate(d.when);

                d.year = d3.time.year(d.date); // pre-calculate month for better performance
                d.month = d3.time.month(d.date); // pre-calculate month for better performance
                d.day = d3.time.day(d.date); // pre-calculate month for better performance
                d.week = d3.time.week(d.date); // pre-calculate month for better performance

                d.total = 1;
                if (d.type === 'READ') {
                    d.read = 1;
                } else {
                    d.read = 0;
                }
                if (d.type === 'MODIFY') {
                    d.modify = 1;
                } else {
                    d.modify = 0;
                }
            });

            var dateDimension = ndx.dimension(function(d) {
                return d.date;
            });

            var minDate = dateDimension.bottom(1)[0].date;
            var maxDate = dateDimension.top(1)[0].date;
            var domain = [minDate, maxDate];

            var dayDimension = ndx.dimension(function(d) {
                return d.day;
            });

            var readGroup = dayDimension.group().reduceSum(function(d) {
                return d.read;
            });

            var modifyGroup = dayDimension.group().reduceSum(function(d) {
                return d.modify;
            });

            var moveChart = dc.lineChart('#monthly-move-chart');
            var volumeChart = dc.barChart('#monthly-volume-chart');
            var nasdaqTable = dc.dataTable('.dc-data-table');

            moveChart
                .renderArea(true)
                .width(990)
                .height(200)
                .transitionDuration(1000)
                .margins({ top: 30, right: 50, bottom: 25, left: 40 })
                .dimension(dayDimension)
                .group(readGroup, 'Read')
                .stack(modifyGroup, 'Modify')
                .mouseZoomable(true)
                .rangeChart(volumeChart)
                .x(d3.time.scale().domain(domain))
                .round(d3.time.days.round)
                .xUnits(d3.time.days)
                .elasticY(true)
                .renderHorizontalGridLines(true)
                .legend(dc.legend().x(800).y(30).itemHeight(13).gap(5))
                .brushOn(false);

            //Range Chart
            volumeChart.width(990)
                .height(40)
                .margins({ top: 0, right: 50, bottom: 20, left: 40 })
                .dimension(dayDimension)
                .group(readGroup, 'Read')
                .stack(modifyGroup, 'Modify')
                .centerBar(true)
                .gap(1)
                .x(d3.time.scale().domain(domain))
                .round(d3.time.days.round)
                //.alwaysUseRounding(true)
                .xUnits(d3.time.days);

            //Table
            nasdaqTable
                .dimension(dateDimension)
                .group(function(d) {
                    var format = d3.format('02d');
                    return d.year.getFullYear() + '/' + format(d.month.getMonth() + 1);
                })
                .size(1000)
                .columns([
                    function(d) {
                        return d.date;
                    },
                    function(d) {
                        return d.type;
                    },
                    function(d) {
                        return d.title;
                    },
                    function(d) {
                        return d.from;
                    },
                    function(d) {
                        return d.to;
                    },
                    function(d) {
                        return d.read;
                    }
                ])
                .sortBy(function(d) {
                    return d.date;
                })
                .order(d3.ascending)
                .on('renderlet', function(table) {
                    table.selectAll('.dc-table-group').classed('info', true);
                });

            // rendering
            dc.renderAll();
        };

    });
