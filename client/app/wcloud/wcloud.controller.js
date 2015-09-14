'use strict';

angular.module('kf6App')
    .controller('WcloudCtrl', function($stateParams, $scope, $community, $http) {
        var viewId = $stateParams.viewId;

        $community.getObject(viewId, function(view) {
            $scope.view = view;
            $community.enter($scope.view.communityId);
            search();
        });

        var search = function() {
            $http.post('/api/contributions/' + $scope.view.communityId + '/search', {
                query: {
                    communityId: $scope.view.communityId,
                    pagesize: 1000
                }
            }).success(function(contributions) {
                var text = '';
                contributions.forEach(function(c) {
                    text += c.text4search;
                });
                var data = processData(text);
//                console.log(data);                
                data.sort(function(a, b) {
                    if (a.size > b.size) return -1;
                    if (a.size < b.size) return 1;
                    return 0;
                });
                data = data.filter(function(d){
                	return d.text.length > 1;
                });
                data = data.splice(0, 50);
//                console.log(data);                
                var countMax = d3.max(data, function(d) {
                    return d.size;
                });
                var sizeScale = d3.scale.linear().domain([0, countMax]).range([10, 100]);
                var words2 = data.map(function(d) {
                    return {
                        text: d.text,
                        size: sizeScale(d.size)
                    };
                });
                //console.log(words2);
                refresh(words2);
            });
        }

        var words = [
            "Hello", "world", "normally", "you", "want", "more", "words",
            "than", "this"
        ];

        var processData = function(strings) {
            // strip stringified objects and punctuations from the string
            strings = strings.toLowerCase().replace(/object Object/g, '').replace(/[\+\.,\/#!$%\^&\*{}=_`~]/g, '');

            // convert the str back in an array 
            strings = strings.split(' ');

            // Count frequency of word occurance
            var wordCount = {};

            for (var i = 0; i < strings.length; i++) {
                if (!wordCount[strings[i]])
                    wordCount[strings[i]] = 0;

                wordCount[strings[i]]++; // {'hi': 12, 'foo': 2 ...}
            }

            //console.log(wordCount);

            var wordCountArr = [];

            for (var prop in wordCount) {
                wordCountArr.push({
                    text: prop,
                    size: wordCount[prop]
                });
            }

            return wordCountArr;
        }

        var mapping = function(array) {
            return array.map(function(d) {
                return {
                    text: d,
                    size: 10 + Math.random() * 90,
                    test: "haha"
                };
            })
        };

        var refresh = function(words) {
            var fill = d3.scale.category20();
            var layout = d3.layout.cloud()
                .size([500, 500])
                .words(words)
                .padding(5)
                .rotate(function() {
                    return ~~(Math.random() * 2) * 90;
                })
                .font("Impact")
                .fontSize(function(d) {
                    return d.size;
                })
                .on("end", draw);
            layout.start();

            function draw(words) {
                d3.select("#wcloud").append("svg")
                    .attr("width", layout.size()[0])
                    .attr("height", layout.size()[1])
                    .append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function(d) {
                        return d.size + "px";
                    })
                    .style("font-family", "Impact")
                    .style("fill", function(d, i) {
                        return fill(i);
                    })
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) {
                        return d.text;
                    });
            }
        };

        //refresh(words);
    });