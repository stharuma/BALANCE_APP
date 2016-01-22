'use strict';

var natural = require('natural'),
    nounInflector = new natural.NounInflector(),
    tokenizer = new natural.WordTokenizer(),
    TfIdf = natural.TfIdf,
    tfidf = new TfIdf();
var uniq = require('uniq');
var pos = require('pos');

angular.module('kf6App').controller('RelatedwordCtrl', function($scope, $community, $http) {
        var viewId = $scope.relatedwordID;  //Contribution ID

        var stopWords = 'dd|dl|tt|br|nbsp|i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i\'m|you\'re|he\'s|she\'s|it\'s|we\'re|they\'re|i\'ve|you\'ve|we\'ve|they\'ve|i\'d|you\'d|he\'d|she\'d|we\'d|they\'d|i\'ll|you\'ll|he\'ll|she\'ll|we\'ll|they\'ll|isn\'t|aren\'t|wasn\'t|weren\'t|hasn\'t|haven\'t|hadn\'t|doesn\'t|don\'t|didn\'t|won\'t|wouldn\'t|shan\'t|shouldn\'t|can\'t|cannot|couldn\'t|mustn\'t|let\'s|that\'s|who\'s|what\'s|here\'s|there\'s|when\'s|where\'s|why\'s|how\'s|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall';
        
        var tfidfmap = {};  //tfidf for all key words in the notes
        var keywordmap = {};
        var text = '';
        var allkeywordweights = {};
        //Set the size of the buttons
        var sizes = [18,17,16,15,14,13,12,11,10,9];
        var prekeytermsresult = [];
        var prekeyterms = [];

        $community.getObject(viewId, function(view) {
            $scope.view = view;
            $community.enter($scope.view.communityId);
            $http.post('/api/contributions/' + $scope.view.communityId + '/search', {
                query: {
                    communityId: $scope.view.communityId,
                    viewIds: [$scope.view.id],
                    pagesize: 1000
                }
            }).success(function(contributions) {
                var noteslength = 0;

                contributions.forEach(function(note) {
                  tfidf.addDocument(note.text4search);
                  text += ' ' + note.text4search;
                  noteslength++;
                });

                var keywordsfornotes= getKeyWords(text);

                keywordsfornotes.forEach(function(word){
                    allkeywordweights[word.str] = word.weight;
                    var tfidfs = new Array(noteslength);
                    tfidf.tfidfs(word.str,function(i, measure){
                        tfidfs[i] = measure;
                    });
                    tfidfmap[word.str] = tfidfs;
                });

                //Compute and save the cossim for each two words
                keywordsfornotes.forEach(function(word){
                    var cossimilarities = [];
                    keywordsfornotes.forEach(function(word2){
                        var wordproperty = {};
                        wordproperty.str = word2.str;
                        wordproperty.cossim = cossim(tfidfmap[word.str], tfidfmap[word2.str]);
                        cossimilarities.push(wordproperty);
                     });
                     keywordmap[word.str] = cossimilarities;
                });
            });
        });

        //compute the cossin similarity of the two words
        var cossim = function(tfidf1, tfidf2){
            var total = 0, cs1 = 0, cs2 = 0;
            var i = 0;
            for(; i < tfidf1.length; i++){
                total += tfidf1[i]*tfidf2[i];
                cs1 += tfidf1[i] * tfidf1[i];
                cs2 += tfidf2[i] * tfidf2[i];
            }
            if(cs1 === 0 || cs2 === 0) { return 0; }
            return total / Math.sqrt(cs1 * cs2);
        };

        //Insert the words to the text editor
        $scope.insertwords = function(str){
            $scope.mceEditor.insertContent(str + ' ');

            $http.post('api/records/' + $scope.view.communityId, {
            type: 'clickword',
            data: {
                word: str,
                contributionId: viewId
              }
            });
        };

        $scope.refreshKeywords = function(str){
          var bodystr = str.match(/<body[^>]*>([^<]*(?:(?!<\/?body)<[^<]*)*)<\/body\s*>/i)[1];
          var keywordfromcurrentnote = getKeyWords(bodystr);
          var relatedwords = [];

          //rank the words according to the weights
          keywordfromcurrentnote.sort(function(a,b){
            return b.weight - a.weight;
          });

          //Get the top n related words in current note
          var topNword = keywordfromcurrentnote[Math.floor(keywordfromcurrentnote.length / 5)];
          keywordfromcurrentnote = keywordfromcurrentnote.filter(function(word){
              return word.weight >= topNword.weight;
          });

          //filter the word according cosin similarity
          keywordfromcurrentnote.forEach(function(word){
                if(keywordmap.hasOwnProperty(word.str)){
                var cossimilarities = keywordmap[word.str];
                cossimilarities.forEach(function(cs){
                  if(cs.cossim >= 0.3) {
                      relatedwords.push(cs.str);
                  }
                });
              }
            });

          var keytermsweights = [];
          var resultkeywords = [];

          if(relatedwords.length === 0){
            for(var key in allkeywordweights){
                relatedwords.push(key);
            }
          }

          uniq(relatedwords);

          //filter the words and get the words that are not shown in current note
          relatedwords = relatedwords.filter(function(word) {
              return bodystr.indexOf(word) < 0;
          });

          relatedwords.forEach(function(word) {
              var wordweight = {};
              wordweight.str = word;
              wordweight.weight = allkeywordweights[word];
              keytermsweights.push(wordweight);
          });

          //Rerange the words according to weights
          keytermsweights.sort(function(a,b){
              return b.weight - a.weight;
          });

          //Get the top ten or all the key terms
          var i;
          for (i = 0; i < 10 && i < keytermsweights.length; i++){
            var ktw = keytermsweights[i];
            var word = {};
            word.str = ktw.str;
            word.size = sizes[i]; //100 * ktw["weight"] / total;
            resultkeywords.push(word);
          }

          var relocate = 1;

          if(prekeytermsresult.length === resultkeywords.length){
              var j = 0;
              relocate = 0;
              while(j < prekeytermsresult.length){
                var word2 = resultkeywords[j];
                if(prekeyterms.indexOf(word2.str) === -1){
                    relocate = 1;
                    break;
                }
                j++;
              }
          }

          if(relocate){
            prekeytermsresult = [];

            prekeyterms = [];

            resultkeywords.sort(function(a,b){
              return a.str.localeCompare(b.str);
            });

            resultkeywords.forEach(function(word){
                prekeytermsresult.push(word);
                prekeyterms.push(word.str);
            });
          }
          else{
            resultkeywords = prekeytermsresult;
          }
          return resultkeywords;
        };

        var countweight = function(str, word){
            var wordArr = tokenizer.tokenize(str.toLowerCase());
            word = word.toLowerCase();
            var count = 0;
            wordArr.forEach(function(str) {
                if(word === str) {count++;}
            });
            return count;
        };

        //Get the key words with weights from the input string
        var getKeyWords = function(str){
          var commonObj = {},
              uncommonArr = [];
          var common = stopWords.split('|');  //Words that will be removed from the string
          var wordArr = tokenizer.tokenize(str.toLowerCase());

          str = '';

          wordArr.forEach(function(word){
              str = str + ' ' + word;
          });
          wordArr = [];

          var words = new pos.Lexer().lex(str);
          var tagger = new pos.Tagger();
          var taggedWords = tagger.tag(words);

          taggedWords.forEach(function(tw){
              if(tw[1]==='NN' || tw[1]==='NNS') { wordArr.push(tw[0]); }
          });

          common.forEach(function(word){
              commonObj[word.trim()] = true;
          });

          uniq(wordArr);

          wordArr.forEach(function(word){
              word = word.trim();
              var wordweight = {};
              if ( !commonObj[word] && word.length > 2 ) {
                  wordweight.str = nounInflector.singularize(word);
                  wordweight.weight = countweight(str, word);
                  uncommonArr.push(wordweight);
              }
          });
          return uncommonArr;
        };
    });
