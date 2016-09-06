'use strict';

/* global d3 */
/* global crossfilter */
/* global dc */

angular.module('kf6App')
    .controller('S2vizCtrl', function($scope, $stateParams, $http, $community, $chord) {
        var communityId = $stateParams.communityId;

        $community.enter(communityId, function() {
            $community.getSocialInteractions(function(interactions) {
                init(interactions);
            });
        });

        var init = function(interactions) {

            var ndx = crossfilter(interactions);

            var dateDim = ndx.dimension(function(d) {
                return d.day;
            });
            var typeDim = ndx.dimension(function(d) {
                return d.type;
            });

            var minDate = dateDim.bottom(1)[0].date;
            var maxDate = dateDim.top(1)[0].date;

            var readGroup = dateDim.group().reduceSum(function(d) {
                return d.read;
            });

            var hitslineChart = dc.barChart('#chart-line-hitsperday');
            hitslineChart
                .width(700).height(200)
                .dimension(dateDim)
                .group(readGroup, 'Read')
                //.renderArea(true)//for line chart
                .centerBar(true) //for line chart
                .x(d3.time.scale().domain([minDate, maxDate]))
                .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
                .yAxisLabel('Hits per day');

            var readingChord = $chord.init($scope, $('#reading-chord'));
            var beingReadChord = $chord.init($scope, $('#beingread-chord'));

            $scope.updateChord = function() {
                var filteredInteractions = typeDim.filter('read').top(Infinity);
                var data;

                data = [];
                filteredInteractions.forEach(function(i) {
                    var d = {};
                    d.importer1 = i.from;
                    d.importer2 = i.to;
                    d.flow1 = 0.1;
                    d.flow2 = 1;
                    data.push(d);
                });
                readingChord.drawChords(data);

                data = [];
                filteredInteractions.forEach(function(i) {
                    var d = {};
                    d.importer1 = i.from;
                    d.importer2 = i.to;
                    d.flow1 = 1;
                    d.flow2 = 0.1;
                    data.push(d);
                });
                beingReadChord.drawChords(data);
            };
            $scope.updateChord();

            // dummy for update
            var hits = dateDim.group().reduceSum(function(d) {
                return d.total;
            });
            var dummy = dc.pieChart('#dummy');
            dummy
                .width(200).height(200)
                .dimension(dateDim)
                .group(hits)
                .innerRadius(30);
            dummy.doRedraw = function() {
                $scope.updateChord();
            };
            dummy.doRender = function() {
                $scope.updateChord();
            };
            // dummy end

            dc.renderAll();
        };

        //// Thinking Usability
        // $scope.mode = 'Selecting';
        // var hitslineChart;
        // $scope.changeMode = function() {
        //     if ($scope.mode === 'Selecting') {
        //         $scope.mode = 'Zooming';
        //         hitslineChart.mouseZoomable(true);
        //         hitslineChart.brushOn(false);
        //         dc.renderAll();
        //     } else {
        //         $scope.mode = 'Selecting';
        //         hitslineChart.mouseZoomable(false);
        //         hitslineChart.brushOn(true);
        //         dc.renderAll();
        //     }
        // };

    });
