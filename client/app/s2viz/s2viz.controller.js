'use strict';


var gTypeDim;

var gUpdateChord;

angular.module('kf6App')
  .controller('S2vizCtrl', function ($scope, $stateParams, $http, $community) {
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
                    if (record.type === 'read' || record.type == 'modified') {
                        var author = communityData.members[record.authorId];
                        var object = catalog[record.targetId];
                        if (!object) {
                            //console.error('object missing');
                            return;
                        }
                        var toAuthor = communityData.members[object.authors[0]];
                        var type = 'READ';
                        if (record.type == 'modified') {
                            type = 'MODIFY';
                        }
                        var aData = {
                            from: author.name,
                            type: type,
                            objectId: "xx",
                            to: toAuthor.name,
                            when: record.timestamp
                        };
                        data.push(aData);
                    }
                });
                method();
            });
        });

        var method = function() {
            // var a = {
            //     __v: 0
            //     _id: "56d91e69d4ae007bf9e9e51f"
            //     authorId: "56d91e69d4ae007bf9e9e51c"
            //     communityId: "56d91e69d4ae007bf9e9e51b"
            //     targetId: "56d91e69d4ae007bf9e9e51e"
            //     timestamp: "2016-03-04T05:34:33.215Z"
            //     type: "created"
            // }

            //                 var data = [{
            //     "from": "Jan van Aalst",
            //     "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
            //     "to": "Chris Teplovs",
            //     "type": "READ",
            //     "when": "2014-12-11T23:07:24Z"
            // }, {

            gUpdateChord = function() {
                $scope.master = []; // MASTER DATA STORED BY YEAR
                var filtered = gTypeDim.filter('READ').top(Infinity);
                filtered.forEach(function(d) {
                    d.importer1 = d.from;
                    d.importer2 = d.to;
                    d.flow1 = 1;
                    d.flow2 = 0.1;

                    $scope.master.push(d);
                })
                $scope.drawChords($scope.master);
            };

            var cf = crossfilter([
                { name: "長門", type: "戦艦", speed: "低", range: "長", endurance: 80, fire: 82 },
                { name: "陸奥", type: "戦艦", speed: "低", range: "長", endurance: 80, fire: 82 },
                { name: "伊勢", type: "戦艦", speed: "低", range: "長", endurance: 74, fire: 74 },
                { name: "日向", type: "戦艦", speed: "低", range: "長", endurance: 74, fire: 74 },
                { name: "雪風", type: "駆逐艦", speed: "高", range: "短", endurance: 16, fire: 10 },
                { name: "赤城", type: "正規空母", speed: "高", range: "短", endurance: 69, fire: 0 },
                { name: "加賀", type: "正規空母", speed: "高", range: "短", endurance: 71, fire: 0 },
                { name: "蒼龍", type: "正規空母", speed: "高", range: "短", endurance: 50, fire: 0 },
                { name: "飛龍", type: "正規空母", speed: "高", range: "短", endurance: 50, fire: 0 },
                { name: "島風", type: "駆逐艦", speed: "高", range: "短", endurance: 19, fire: 12 },
                { name: "吹雪", type: "駆逐艦", speed: "高", range: "短", endurance: 15, fire: 10 },
                { name: "白雪", type: "駆逐艦", speed: "高", range: "短", endurance: 15, fire: 10 },
                { name: "初雪", type: "駆逐艦", speed: "高", range: "短", endurance: 15, fire: 10 },
                { name: "深雪", type: "駆逐艦", speed: "高", range: "短", endurance: 15, fire: 10 },
                { name: "叢雲", type: "駆逐艦", speed: "高", range: "短", endurance: 15, fire: 10 },
                { name: "磯波", type: "駆逐艦", speed: "高", range: "短", endurance: 15, fire: 10 },
                { name: "綾波", type: "駆逐艦", speed: "高", range: "短", endurance: 15, fire: 10 },
                { name: "敷波", type: "駆逐艦", speed: "高", range: "短", endurance: 15, fire: 10 },
                { name: "大井", type: "軽巡洋艦", speed: "高", range: "中", endurance: 25, fire: 14 },
                { name: "北上", type: "軽巡洋艦", speed: "高", range: "中", endurance: 25, fire: 14 },
                { name: "金剛", type: "戦艦", speed: "高", range: "長", endurance: 63, fire: 63 },
                { name: "比叡", type: "戦艦", speed: "高", range: "長", endurance: 63, fire: 63 },
                { name: "榛名", type: "戦艦", speed: "高", range: "長", endurance: 63, fire: 63 },
                { name: "霧島", type: "戦艦", speed: "高", range: "長", endurance: 63, fire: 63 },
                { name: "鳳翔", type: "軽空母", speed: "低", range: "短", endurance: 30, fire: 0 },
                { name: "扶桑", type: "戦艦", speed: "低", range: "長", endurance: 67, fire: 74 },
                { name: "山城", type: "戦艦", speed: "低", range: "長", endurance: 67, fire: 74 },
                { name: "天龍", type: "軽巡洋艦", speed: "高", range: "中", endurance: 23, fire: 11 },
                { name: "龍田", type: "軽巡洋艦", speed: "高", range: "中", endurance: 23, fire: 11 },
                { name: "龍驤", type: "軽空母", speed: "高", range: "短", endurance: 31, fire: 0 }
            ]);

            var dimType = cf.dimension(function(d) {
                return d.type;
            });


            // 艦種
            var gpType = dimType.group().reduceCount();
            var chartType = dc.pieChart('#chart_type');
            chartType
                .width(300)
                .height(220)
                //.cx(160)
                .innerRadius(35)
                .slicesCap(3) // 上位3種のみ表示し、後はその他とする
                .dimension(dimType)
                .group(gpType)
                .ordering(function(t) {
                    return -t.value;
                })
                .legend(dc.legend())
            chartType.render();


            var data2 = [{
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Jianwei Zhang",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Jianwei Zhang",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "0b15af66-5aff-41e7-9199-92d517741b4a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-11T23:07:24Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Jin M",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Jan van Aalst",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Ole Smordal",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ahmad Khanlari",
                "objectId": "1782c3e5-2211-4408-99b4-0eccbc89b089",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T07:03:38Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "20680ee7-1fa1-4f34-b5f2-d56f45c64276",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T10:06:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "20680ee7-1fa1-4f34-b5f2-d56f45c64276",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T10:06:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "20680ee7-1fa1-4f34-b5f2-d56f45c64276",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-15T10:06:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "20680ee7-1fa1-4f34-b5f2-d56f45c64276",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-15T10:06:00Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Huangyao Hong",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Ole Smordal",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Jin M",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "20f72522-4d62-4d89-907c-c32b447a54dc",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Huangyao Hong",
                "objectId": "2542ae6e-13c3-4d11-9383-4a2435b1f7b2",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-15T06:29:11Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "2f966501-cb78-4342-8ba3-905ec65cbbbd",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-17T09:55:03Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Huangyao Hong",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Jan van Aalst",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Jan van Aalst",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Christian Perreault",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "40693b20-2be7-4126-a372-34ecda62bfa2",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T18:26:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Christian Perreault",
                "objectId": "446ab870-3f57-4fc7-b456-7855acfb894f",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-15T06:48:21Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "4770fbb0-17bc-4144-8a3a-2676f716b79e",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T11:51:06Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "4770fbb0-17bc-4144-8a3a-2676f716b79e",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T11:51:06Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "4770fbb0-17bc-4144-8a3a-2676f716b79e",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T11:51:06Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "4770fbb0-17bc-4144-8a3a-2676f716b79e",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T11:51:06Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "49ebc41e-b431-4fd4-8652-65b30de46aa4",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-14T21:25:58Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "49ebc41e-b431-4fd4-8652-65b30de46aa4",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-14T21:25:58Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "49ebc41e-b431-4fd4-8652-65b30de46aa4",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T21:25:58Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "49ebc41e-b431-4fd4-8652-65b30de46aa4",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T21:25:58Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "49ebc41e-b431-4fd4-8652-65b30de46aa4",
                "to": "Jin M",
                "type": "READ",
                "when": "2014-12-14T21:25:58Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "49ebc41e-b431-4fd4-8652-65b30de46aa4",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-14T21:25:58Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "49ebc41e-b431-4fd4-8652-65b30de46aa4",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-14T21:25:58Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "49ebc41e-b431-4fd4-8652-65b30de46aa4",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-14T21:25:58Z"
            }, {
                "from": "Jianwei Zhang",
                "objectId": "560394e8-a538-4bcc-82f2-68e7f2c4988d",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T10:28:18Z"
            }, {
                "from": "Jianwei Zhang",
                "objectId": "560394e8-a538-4bcc-82f2-68e7f2c4988d",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T10:28:18Z"
            }, {
                "from": "Jianwei Zhang",
                "objectId": "560394e8-a538-4bcc-82f2-68e7f2c4988d",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-15T10:28:18Z"
            }, {
                "from": "Jianwei Zhang",
                "objectId": "560394e8-a538-4bcc-82f2-68e7f2c4988d",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-15T10:28:18Z"
            }, {
                "from": "Jin M",
                "objectId": "5b75867b-5909-4799-ba3a-82b8b328e820",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T00:01:12Z"
            }, {
                "from": "Jin M",
                "objectId": "5b75867b-5909-4799-ba3a-82b8b328e820",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T00:01:12Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T07:02:55Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "66e55ecd-3945-4f29-b4f7-faa0111c7a4c",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-18T04:04:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "66e55ecd-3945-4f29-b4f7-faa0111c7a4c",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-18T04:04:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "66e55ecd-3945-4f29-b4f7-faa0111c7a4c",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-18T04:04:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "66e55ecd-3945-4f29-b4f7-faa0111c7a4c",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-18T04:04:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "66e55ecd-3945-4f29-b4f7-faa0111c7a4c",
                "to": "Chris Teplovs",
                "type": "UPDATE",
                "when": "2014-12-18T04:04:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "66e55ecd-3945-4f29-b4f7-faa0111c7a4c",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-18T04:04:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "6768b3ba-04a7-4558-8a72-f01ffaaa1b0c",
                "to": "Chris Teplovs",
                "type": "DELETE",
                "when": "2014-12-17T09:57:15Z"
            }, {
                "from": "Hongyan Song",
                "objectId": "6ac025ef-a6da-49ff-8113-5ab7aef951b4",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-15T08:23:47Z"
            }, {
                "from": "Hongyan Song",
                "objectId": "6ac025ef-a6da-49ff-8113-5ab7aef951b4",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-15T08:23:47Z"
            }, {
                "from": "Hongyan Song",
                "objectId": "6ac025ef-a6da-49ff-8113-5ab7aef951b4",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T08:23:47Z"
            }, {
                "from": "Hongyan Song",
                "objectId": "6ac025ef-a6da-49ff-8113-5ab7aef951b4",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-15T08:23:47Z"
            }, {
                "from": "Hongyan Song",
                "objectId": "6ac025ef-a6da-49ff-8113-5ab7aef951b4",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-15T08:23:47Z"
            }, {
                "from": "Hongyan Song",
                "objectId": "6ac025ef-a6da-49ff-8113-5ab7aef951b4",
                "to": "Christian Perreault",
                "type": "READ",
                "when": "2014-12-15T08:23:47Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Jianwei Zhang",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "6f5b725c-0d9c-4038-a1e7-187209ebe2a8",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T07:58:14Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "773c87d5-4d4c-4b39-9970-e986fdead705",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-16T04:13:43Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Ole Smordal",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Christian Perreault",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Jianwei Zhang",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Jin M",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Jin M",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "7b834182-aeea-4d4c-9e93-cb507e44ee91",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-14T21:29:57Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "86d6d1a1-c629-40d6-9ddb-0161660f11da",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-15T10:18:29Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "86d6d1a1-c629-40d6-9ddb-0161660f11da",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-15T10:18:29Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "86d6d1a1-c629-40d6-9ddb-0161660f11da",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-15T10:18:29Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "86d6d1a1-c629-40d6-9ddb-0161660f11da",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-15T10:18:29Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "8a382f0c-689f-4a0e-b81b-73cedbb6530d",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-16T04:14:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "8a382f0c-689f-4a0e-b81b-73cedbb6530d",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T04:14:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "8a382f0c-689f-4a0e-b81b-73cedbb6530d",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-16T04:14:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "8a382f0c-689f-4a0e-b81b-73cedbb6530d",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T04:14:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "8a382f0c-689f-4a0e-b81b-73cedbb6530d",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T04:14:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "8a382f0c-689f-4a0e-b81b-73cedbb6530d",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T04:14:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "8a382f0c-689f-4a0e-b81b-73cedbb6530d",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T04:14:00Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "8a382f0c-689f-4a0e-b81b-73cedbb6530d",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T04:14:00Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "8e9e4f62-c422-4fa5-881d-f31fe356f1e3",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-17T09:56:24Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "9aa33e55-e61e-4568-8cef-24e2cd9ab6c7",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-17T10:05:25Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "9bbaaf2f-05c3-4f33-9b99-903bb5aa237a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T22:31:08Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "9bbaaf2f-05c3-4f33-9b99-903bb5aa237a",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-14T22:31:08Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "9bbaaf2f-05c3-4f33-9b99-903bb5aa237a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T22:31:08Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "9bbaaf2f-05c3-4f33-9b99-903bb5aa237a",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-14T22:31:08Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "9bbaaf2f-05c3-4f33-9b99-903bb5aa237a",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-14T22:31:08Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "9bbaaf2f-05c3-4f33-9b99-903bb5aa237a",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-14T22:31:08Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "ac10b2ab-b25c-4ede-8c72-3238b7322672",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T09:53:27Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "ac10b2ab-b25c-4ede-8c72-3238b7322672",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T09:53:27Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "ac10b2ab-b25c-4ede-8c72-3238b7322672",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T09:53:27Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "ac10b2ab-b25c-4ede-8c72-3238b7322672",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T09:53:27Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "ac10b2ab-b25c-4ede-8c72-3238b7322672",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T09:53:27Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "ac10b2ab-b25c-4ede-8c72-3238b7322672",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T09:53:27Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "ac10b2ab-b25c-4ede-8c72-3238b7322672",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T09:53:27Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Fernando Diaz del Castillo",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Huangyao Hong",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Huangyao Hong",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Ole Smordal",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Huangyao Hong",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Huangyao Hong",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Huangyao Hong",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Jin M",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-10T17:29:44Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "ae53f19e-540f-4cb4-8b5d-6ece4cdba758",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-18T04:04:22Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "ae53f19e-540f-4cb4-8b5d-6ece4cdba758",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-18T04:04:22Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "ae53f19e-540f-4cb4-8b5d-6ece4cdba758",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-18T04:04:22Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "ae53f19e-540f-4cb4-8b5d-6ece4cdba758",
                "to": "Chris Teplovs",
                "type": "READ",
                "when": "2014-12-18T04:04:22Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "ae53f19e-540f-4cb4-8b5d-6ece4cdba758",
                "to": "Chris Teplovs",
                "type": "UPDATE",
                "when": "2014-12-18T04:04:22Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "aeef0c2a-873c-4a1b-9cfa-f1e4ff2ae80e",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-17T10:04:41Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "aeef0c2a-873c-4a1b-9cfa-f1e4ff2ae80e",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-17T10:04:41Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Jan van Aalst",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Jianwei Zhang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Christian Perreault",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Ole Smordal",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Jin M",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "bb6c12af-726b-4693-a19d-bd7a86a46c0a",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-14T12:05:12Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Ole Smordal",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Jan van Aalst",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Jin M",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Jan van Aalst",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Erick Godinez",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "c29f11a9-d2a1-4cbc-8b47-b4ffdd62a1cf",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-12T10:58:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Yoshiaki Matsuzawa",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Ole Smordal",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T04:16:34Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "c95bb192-4ddd-4a2a-b6e5-c38372de4deb",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-17T10:05:30Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "d3708d9c-c694-484e-b88f-70701c81c99f",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-12T10:31:50Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "d3708d9c-c694-484e-b88f-70701c81c99f",
                "to": "frankk de Jong",
                "type": "READ",
                "when": "2014-12-12T10:31:50Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "d3708d9c-c694-484e-b88f-70701c81c99f",
                "to": "Hongyan Song",
                "type": "READ",
                "when": "2014-12-12T10:31:50Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "d3708d9c-c694-484e-b88f-70701c81c99f",
                "to": "Jianwei Zhang",
                "type": "READ",
                "when": "2014-12-12T10:31:50Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "d3708d9c-c694-484e-b88f-70701c81c99f",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-12T10:31:50Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "d3708d9c-c694-484e-b88f-70701c81c99f",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-12T10:31:50Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "e8f7da6c-13a5-40c9-8df0-2b161d44997b",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-17T10:05:33Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "efb80eac-8689-44a2-9463-5183d788bf8e",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T09:00:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "efb80eac-8689-44a2-9463-5183d788bf8e",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T09:00:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "efb80eac-8689-44a2-9463-5183d788bf8e",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T09:00:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "efb80eac-8689-44a2-9463-5183d788bf8e",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T09:00:44Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "efb80eac-8689-44a2-9463-5183d788bf8e",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T09:00:44Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "f07ca24b-850a-420f-bfe9-bdb865b030b5",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T10:09:03Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "f07ca24b-850a-420f-bfe9-bdb865b030b5",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T10:09:03Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "f07ca24b-850a-420f-bfe9-bdb865b030b5",
                "to": "Lia Spreeuwenberg",
                "type": "READ",
                "when": "2014-12-16T10:09:03Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Sylvie Ratte",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Jianwei Zhang",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Ahmad Khanlari",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Bodong Chen",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "Jan van Aalst",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T08:28:51Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "ffea1623-c2b4-4636-9e76-37613bd24b31",
                "to": "Fei Fang",
                "type": "READ",
                "when": "2014-12-16T11:01:07Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "ffea1623-c2b4-4636-9e76-37613bd24b31",
                "to": "Therese Laferriere",
                "type": "READ",
                "when": "2014-12-16T11:01:07Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "2d968ccd-e1ed-4364-a75a-bc2f09ef7b59",
                "to": "Yoshiaki Matsuzawa",
                "type": "BUILDON",
                "when": "2014-12-17T10:05:25Z"
            }, {
                "from": "Chris Teplovs",
                "objectId": "ac10b2ab-b25c-4ede-8c72-3238b7322672",
                "to": "Chris Teplovs",
                "type": "BUILDON",
                "when": "2014-12-16T10:09:03Z"
            }, {
                "from": "frankk de Jong",
                "objectId": "add053d2-296a-40c9-b2e5-b53ed4b31e3d",
                "to": "frankk de Jong",
                "type": "BUILDON",
                "when": "2014-12-15T01:25:57Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "63f42786-fd5b-4ed0-b0d5-6bbc205cf464",
                "to": "Chris Teplovs",
                "type": "BUILDON",
                "when": "2014-12-17T09:55:03Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Ole Smordal",
                "type": "BUILDON",
                "when": "2014-12-18T04:04:12Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "c6d2b395-4641-4cdd-b51c-6aab3e3db42e",
                "to": "Ole Smordal",
                "type": "BUILDON",
                "when": "2014-12-18T04:04:22Z"
            }, {
                "from": "Bodong Chen",
                "objectId": "fda580ea-e09a-43e7-bc92-10debb70d7e1",
                "to": "Jan van Aalst",
                "type": "BUILDON",
                "when": "2014-12-16T11:51:06Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "2d968ccd-e1ed-4364-a75a-bc2f09ef7b59",
                "to": "Yoshiaki Matsuzawa",
                "type": "BUILDON",
                "when": "2014-12-17T10:05:33Z"
            }, {
                "from": "Yoshiaki Matsuzawa",
                "objectId": "2d968ccd-e1ed-4364-a75a-bc2f09ef7b59",
                "to": "Yoshiaki Matsuzawa",
                "type": "BUILDON",
                "when": "2014-12-17T10:05:30Z"
            }];

            var links = data;
            //            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;
            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;
            links.forEach(function(d) {
                var date = d.when;
                d.date = parseDate(date);
                d.total = 1;
                if (d.type === 'READ') {
                    d.read = 1;
                } else {
                    d.read = 0;
                }
                if (d.type === 'BUILDON') {
                    d.buildson = 1;
                } else {
                    d.buildson = 0;
                }
                if (d.type === 'MODIFY') {
                    d.modify = 1;
                } else {
                    d.modify = 0;
                }
            });

            //dataからcrossfilterのインスタンスを作成
            var ndx = crossfilter(links);

            //line chart

            //X軸をtimelineにするためdateのdimensionを作成
            var dateDim = ndx.dimension(function(d) {
                return d.date;
            });

            var minDate = dateDim.bottom(1)[0].date;
            var maxDate = dateDim.top(1)[0].date;

            var type_read = dateDim.group().reduceSum(function(d) {
                return d.read;
            });
            var type_buildson = dateDim.group().reduceSum(function(d) {
                return d.buildson;
            });
            var type_modify = dateDim.group().reduceSum(function(d) {
                return d.modify;
            });
            var hitslineChart = dc.lineChart("#chart-line-hitsperday");
            hitslineChart
                .width(700).height(200)
                .dimension(dateDim)
                .group(type_read, "Read")
                .stack(type_buildson, "Buildson")
                .stack(type_modify, "Modify")
                .renderArea(true)
                .x(d3.time.scale().domain([minDate, maxDate]))
                .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5))
                .yAxisLabel("Hits per day");

            //pie chart
            var typeDim = ndx.dimension(function(d) {
                return d.type;
            });
            gTypeDim = typeDim;

            var type_total = typeDim.group().reduceSum(function(d) {
                return d.total;
            });
            var typeRingChart = dc.pieChart("#chart-ring-year");
            typeRingChart
                .width(200).height(200)
                .dimension(typeDim)
                .group(type_total)
                .innerRadius(30);

            $scope.updateChord = function() {
                $scope.master = []; // MASTER DATA STORED BY YEAR
                //                console.log('updateChord');
                var filtered = typeDim.filter('READ').top(Infinity);
                //                links.forEach(function(d) {
                filtered.forEach(function(d) {
                    d.importer1 = d.from;
                    d.importer2 = d.to;
                    d.flow1 = 0.1;
                    d.flow2 = 1;

                    $scope.master.push(d);
                })
                if ($scope.drawChords) {
                    $scope.drawChords($scope.master);
                }
                //});
            };
            $scope.updateChord();

            var hits = dateDim.group().reduceSum(function(d) {
                //console.log('x');
                return d.total;
            });

            var x = dc.pieChart("#x");
            x
                .width(200).height(200)
                .dimension(dateDim)
                .group(hits)
                .innerRadius(30);
            x.doRedraw = function() {
                $scope.updateChord();
                gUpdateChord();
            };
            x.doRender = function() {
                $scope.updateChord();
                //gUpdateChord();
            };

            dc.renderAll();
        };
  });
