/* global d3 */
'use strict';

angular.module('kf6App')
    .controller('WcloudCtrl', function($stateParams, $scope, $community, $http) {
        var STOP_WORDS = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/;
        var viewId = $stateParams.viewId;

        $community.getObject(viewId, function(view) {
            $scope.view = view;
            $community.enter($scope.view.communityId);
            refresh();
        });

        var refresh = function() {
            $http.post('/api/contributions/' + $scope.view.communityId + '/search', {
                query: {
                    communityId: $scope.view.communityId,
                    viewIds: [$scope.view._id],
                    pagesize: 1000
                }
            }).success(function(contributions) {
                var data = processData(contributions);
                refreshView(data);
            });
        };

        var processData = function(notes) {

            //create words list and count, filter, sort, and chop
            var words = createWords(notes, 50, STOP_WORDS); //[{word: 'home', count: 20}..]

            //scaling count to word size
            //change data format from words into d3-cloud 
            var countMax = d3.max(words, function(d) {
                return d.count;
            });
            var sizeScale = d3.scale.linear().domain([0, countMax]).range([10, 100]);
            var d3CloudData = words.map(function(d) {
                return {
                    text: d.word,
                    size: sizeScale(d.count)
                };
            });

            //console.log(JSON.stringify(d3CloudData));
            return d3CloudData;
        };

        var createWords = function(notes, topN, stopWordsExp) {
            // concatinate all note's contents to the text
            var text = '';
            notes.forEach(function(note) {
                text += ' ' + note.text4search;
            });

            // break into words
            var processedText = text.toLowerCase().replace(/[\(\)\+\.,\/#!$%\^&\*{}=_`~]/g, '');
            processedText = processedText.replace(/[\r\n\t\u00A0\u3000]/g, ' ');
            //\u00A0 means &nbsp; \u3000 means full-space

            //dont do this, "This" will be changed "Th" by replacing is.
            //processedText = processedText.replace(stopWordsExp, '');
            var words = processedText.split(' ');           

            // filter words
            words = words.filter(function(word) {
                if (word.match(stopWordsExp)) {
                    return false;
                }
                if (word.length === 0) {//one-character word in ChineseCharacter like 車 cannot be detected if threshold is 1.
                    return false;
                }
                return true;
            });

            // count frequency using hashtable
            var wordCountTable = {};
            words.forEach(function(each) {
                if (!wordCountTable[each]) {
                    wordCountTable[each] = 0;
                }

                wordCountTable[each]++; // {'hi': 12, 'foo': 2 ...}
            });

            // change the data format into object array
            var wordCounts = [];
            for (var key in wordCountTable) {
                wordCounts.push({
                    word: key,
                    count: wordCountTable[key]
                });
            }

            // sort by frequency
            wordCounts.sort(function(a, b) {
                if (a.count > b.count) {
                    return -1;
                }
                if (a.count < b.count) {
                    return 1;
                }
                return 0;
            });

            // limit into topN
            wordCounts = wordCounts.splice(0, topN);

            return wordCounts;
        };

        var refreshView = function(words) {
            function draw(words) {
                d3.select('#wcloud').append('svg')
                    .attr('width', layout.size()[0])
                    .attr('height', layout.size()[1])
                    .append('g')
                    .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')')
                    .selectAll('text')
                    .data(words)
                    .enter().append('text')
                    .style('font-size', function(d) {
                        return d.size + 'px';
                    })
                    .style('font-family', 'Impact')
                    .style('fill', function(d, i) {
                        return fill(i);
                    })
                    .attr('text-anchor', 'middle')
                    .attr('transform', function(d) {
                        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
                    })
                    .text(function(d) {
                        return d.text;
                    });
            }

            var fill = d3.scale.category20();
            var layout = d3.layout.cloud()
                .size([500, 500])
                .words(words)
                .padding(5)
                .rotate(function() {
                    return Math.floor(Math.random() * 2) * 90;
                })
                .font('Impact')
                .fontSize(function(d) {
                    return d.size;
                })
                .on('end', draw);
            layout.start();
        };
    });