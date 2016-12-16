'use strict';

/* global d3 */
/* global crossfilter */
/* global dc */

angular.module('kf6App')
    .controller('Dashboard2Ctrl', function($scope, $stateParams, $http, $community) {

        var communityId = $stateParams.communityId;

        $community.enter(communityId, function() {
            $community.refreshMembers(function() {
                var query = {};
                query.pagesize = 10000;
                query.page = 1;
                $http.post('/api/contributions/' + communityId + '/search', {
                    query: query
                }).success(function(contributions) {
                    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;
                    var data = [];
                    contributions.forEach(function(each) {
                        var d = {};

                        d.type = each.type;
                        d.title = each.title;
                        d.when = each.created;

                        d.author = $community.getCommunityData().members[each.authors[0]];
                        d.noteId = each._id;
                        d.from = d.author.name; //from indicates author

                        if (each.type === 'Note') {
                            d.note = 1;
                        }
                        d.value = 1;

                        d.date = parseDate(d.when);
                        d.year = d3.time.year(d.date);
                        d.month = d3.time.month(d.date);
                        d.day = d3.time.day(d.date);
                        d.week = d3.time.week(d.date);
                        data.push(d);
                    });
                    init(data);
                });
            });
        });

        var init = function(data) {
            var ndx = crossfilter(data);

            var all = ndx.groupAll();

            var dateDimension = ndx.dimension(function(d) {
                return d.date;
            });
            var dayDimension = ndx.dimension(function(d) {
                return d.day;
            });
            var typeDimension = ndx.dimension(function(d) {
                return d.type;
            });
            var authorDimension = ndx.dimension(function(d) {
                return d.from;
            });

            var minDate = dateDimension.bottom(1)[0].date;
            var maxDate = dateDimension.top(1)[0].date;
            var domain = [minDate, maxDate];

            var noteGroup = dayDimension.group().reduceSum(function(d) {
                return d.note;
            });
            // var modifyGroup = dayDimension.group().reduceSum(function(d) {
            //     return d.modify;
            // });
            var typeGroup = typeDimension.group().reduceSum(function(d) {
                return d.value;
            });
            var authorGroup = authorDimension.group().reduceSum(function(d) {
                return d.value;
            });

            var typeChart = dc.pieChart('#type-chart');
            var authorChart = dc.rowChart('#author-chart');
            var lineChart = dc.barChart('#line-chart');
            var rangeChart = dc.barChart('#range-chart');
            var recordCount = dc.dataCount('.dc-data-count');
            var recordTable = dc.dataTable('.dc-data-table');

            //TypeChart
            typeChart
                .width(180)
                .height(180)
                .radius(80)
                .dimension(typeDimension)
                .group(typeGroup)
                .label(function(d) {
                    var label = d.data.key;
                    if (typeChart.hasFilter() && !typeChart.hasFilter(label)) {
                        return label + '(0%)';
                    }
                    if (all.value()) {
                        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
                    }
                    return label;
                });

            //AuthorChart
            authorChart
                .width(180)
                .height(180)
                .margins({ top: 20, left: 10, right: 10, bottom: 20 })
                .group(authorGroup)
                .dimension(authorDimension)
                .label(function(d) {
                    return d.key + ' (' + d.value + ')';
                })
                .elasticX(true)
                .xAxis().ticks(4);

            //LineChart
            lineChart
            //.renderArea(true)//forBarChart
                .centerBar(true) //forBarChart
                .width(990)
                .height(200)
                .transitionDuration(1000)
                .margins({ top: 30, right: 50, bottom: 25, left: 40 })
                .dimension(dayDimension)
                .group(noteGroup, 'Note')
                .mouseZoomable(true)
                .rangeChart(rangeChart)
                .x(d3.time.scale().domain(domain))
                .round(d3.time.days.round)
                .xUnits(d3.time.days)
                .elasticY(true)
                .renderHorizontalGridLines(true)
                .legend(dc.legend().x(800).y(30).itemHeight(13).gap(5))
                .brushOn(false);

            //Range Chart
            rangeChart.width(990)
                .height(40)
                .margins({ top: 0, right: 50, bottom: 20, left: 40 })
                .dimension(dayDimension)
                .group(noteGroup, 'Nead')
                .centerBar(true)
                .gap(1)
                .x(d3.time.scale().domain(domain))
                .round(d3.time.days.round)
                //.alwaysUseRounding(true)
                .xUnits(d3.time.days);

            //Count
            recordCount
                .dimension(ndx)
                .group(all);

            //Table
            recordTable
                .dimension(dateDimension)
                .group(function(d) {
                    var format = d3.format('02d');
                    return d.year.getFullYear() + '/' + format(d.month.getMonth() + 1);
                })
                .size(1000)
                .columns([
                    function(d) {
                        var str = "";
                        str += '<a href="/contribution/' + d.noteId + '">';
                        str += d.title;
                        str += '</a>';
                        return str;
                    },
                    function(d) {
                        return d.from;
                    },
                    function(d) {
                        return d.date;
                    }
                ])
                .sortBy(function(d) {
                    return d.date;
                })
                .order(d3.ascending)
                .on('renderlet', function(table) {
                    table.selectAll('.dc-table-group').classed('info', true);
                });

            $scope.reset = function() {
                lineChart.filterAll();
                rangeChart.filterAll();
                dc.renderAll();
            };

            // rendering
            dc.renderAll();
        };

    });
