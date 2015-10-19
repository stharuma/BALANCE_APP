'use strict';

var natural = require('natural'),
    nounInflector = new natural.NounInflector(),
    verbInflector = new natural.PresentVerbInflector(),
    tokenizer = new natural.WordTokenizer(),
    TfIdf = natural.TfIdf,
    tfidf = new TfIdf();
var uniq = require('uniq');
var pos = require('pos');

angular.module('kf6App')
    .controller('RelatedwordCtrl', function($scope, $community, $http) {

        var viewId = $scope.relatedwordID;
        var stopWords = "dd|dl|tt|br|nbsp|i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall";
        var tfidfmap = new Object();  //tfidf for all key words in the notes
        var keywordmap = new Object();
        var text = '';

        $community.getObject(viewId, function(view) {
            $scope.view = view;
            $community.enter($scope.view.communityId);
            $http.post('/api/contributions/' + $scope.view.communityId + '/search', {
                query: {
                    communityId: $scope.view.communityId,
                    viewIds: [$scope.view._id],
                    pagesize: 1000
                }
            }).success(function(contributions) {
                var noteslength = 0;

                contributions.forEach(function(note) {
                  tfidf.addDocument(note.text4search);
                  text += ' ' + note.text4search;
                  noteslength++;
                });

                var keywordsfornotes = getKeyWords(text);

                keywordsfornotes.forEach(function(word){
                    var tfidfs = new Array(noteslength);
                    tfidf.tfidfs(word["str"],function(i, measure){
                        tfidfs[i] = measure;
                    });
                    tfidfmap[word["str"]] = tfidfs;
                });

                keywordsfornotes.forEach(function(word){
                    var cossimilarities = [];
                    keywordsfornotes.forEach(function(word2){
                        var word_property = {};
                        word_property["str"] = word2["str"];
                        word_property["cossim"] = cossim(tfidfmap[word["str"]], tfidfmap[word2["str"]]);
                        cossimilarities.push(word_property);
                     });
                     keywordmap[word["str"]] = cossimilarities;
                });
            });
        });

        var cossim = function(tfidf1, tfidf2){
            var total = 0, cs1 = 0, cs2 = 0;
            var i = 0;
            for(; i < tfidf1.length; i++){
                total += tfidf1[i]*tfidf2[i];
                cs1 += tfidf1[i] * tfidf1[i];
                cs2 += tfidf2[i] * tfidf2[i];
            }
            if(cs1 === 0 || cs2 === 0) return 0;
            return total / Math.sqrt(cs1 * cs2);
        };

        $scope.insertwords = function(str){
            $scope.mceEditor.insertContent(str);
        };

        $scope.refreshKeywords = function(str){
          var body_str = str.match(/<body[^>]*>([^<]*(?:(?!<\/?body)<[^<]*)*)<\/body\s*>/i)[1];
          var keywordfromcurrentnote = getKeyWords(body_str);
          var relatedwords = [];
          keywordfromcurrentnote.sort(function(a,b){
            return b["weight"] - a["weight"];
          });

          var topNword = keywordfromcurrentnote[Math.floor(keywordfromcurrentnote.length / 5)];
          keywordfromcurrentnote = keywordfromcurrentnote.filter(function(word){
              return word["weight"] >= topNword["weight"];
          });
          // window.alert("4");
          keywordfromcurrentnote.forEach( function(word){
              var cossimilarities = keywordmap[word["str"]];
              cossimilarities.forEach(function(cs){
                if(cs["cossim"] >= 0.3) {
                    relatedwords.push(cs["str"]);
                }
              });
          });

          var keytermsweights = [];
          var resultkeywords = [];

          uniq(relatedwords);

          //filter the words and get the words that are not shown in current note
          relatedwords = relatedwords.filter(function(word) {
              return body_str.indexOf(word) < 0;
          });

          relatedwords.forEach(function(word) {
              var word_weight = {};
              word_weight["str"] = word;
              word_weight["weight"] = countweight(text, word);
              keytermsweights.push(word_weight);
          });

          keytermsweights.sort(function(a,b){
              return b["weight"] - a["weight"];
          });

          if(keytermsweights.length >= 10){
            var i;
            for (i = 0; i < 10; i++){
              var ktw = keytermsweights[i];
              resultkeywords.push(ktw["str"]);
            }
          }
          else{
              keytermsweights.forEach(function(word) {
                  resultkeywords.push(word["str"]);
              });
          };

          return resultkeywords;
        };

        var countweight = function(str, word){
            var wordArr = tokenizer.tokenize(str.toLowerCase());
            word = word.toLowerCase();
            var count = 0;
            wordArr.forEach(function(str) {
                if(word === str) count++;
            });
            return count;
        };

        //Get the key words with weights from the input string
        var getKeyWords = function(str){
          var commonObj = {},
              uncommonArr = [];
          var common = stopWords.split('|');  //Words that will be removed from the string
          var wordArr = tokenizer.tokenize(str.toLowerCase());

          str = "";

          wordArr.forEach(function(word){
              str = str + " " + word;
          });
          wordArr = [];

          var words = new pos.Lexer().lex(str);
          var tagger = new pos.Tagger();
          var taggedWords = tagger.tag(words);

          taggedWords.forEach(function(tw){
              if(tw[1]==="NN" || tw[1]==="NNS")
                  wordArr.push(tw[0]);
          });

          common.forEach(function(word){
              commonObj[word.trim()] = true;
          });

          uniq(wordArr);

          wordArr.forEach(function(word){
              word = word.trim();
              var word_weight = {};
              if ( !commonObj[word] && word.length >= 2 ) {
                  word_weight["str"] = word;
                  word_weight["weight"] = countweight(str, word);
                  uncommonArr.push(word_weight);
              }
          });
          return uncommonArr;
        };
    });
