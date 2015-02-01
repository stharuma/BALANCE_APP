'use strict';

angular.module('kf6App')
    .factory('$kftag', function($community, $http) {
        var obj = {};

        obj.createNewReferenceTag = function(contId, title, authors, text) {
            var tag = '';
            tag = tag + '<span class="mceNonEditable KFReference" id="' + contId + '">';
            tag = tag + obj.createReferenceTag(contId, title, authors, text);
            tag = tag + '</span>';
            return tag;
        };

        obj.createReferenceTag = function(contId, title, authors, text) {
            var authorText = $community.makeAuthorStringByIds(authors);
            var tag = '';
            if (text && text.length > 0) {
                tag = tag + '<span class="KFReferenceQuote"><span>"</span><span class="KFReferenceText">' + text + '</span><span>"</span></span>';
            }
            tag = tag + '<span> (<a href="contribution/' + contId + '">';
            tag = tag + '<img src="/manual_assets/kf4images/icon-note-unread-othr-.gif">"' + title + '"</a>';
            tag = tag + '<span class="KFReferenceAuthor"> by ' + authorText + '</span>)</span>';
            tag = tag + '</span>';
            return tag;
        };

        obj.createNewScaffoldTag = function(supportId, title) {
            var tag = '';
            tag = tag + '<br/>';
            tag = tag + '<span id="' + supportId + '" class="KFSupportStart mceNonEditable">';
            tag = tag + obj.createScaffoldStartTag(title);
            tag = tag + '</span>';
            tag = tag + '- enter your idea here -';
            tag = tag + '<span id="' + supportId + '" class="KFSupportEnd mceNonEditable">';
            tag = tag + obj.createScaffoldEndTag();
            tag = tag + '<span>';
            tag = tag + '<br/>';
            return tag;
        };

        obj.createScaffoldStartTag = function(title) {
            var tag = '';
            tag = tag + '<span class="kfSupportStartMark">&nbsp; </span>';
            tag = tag + '<span class="kfSupportStartLabel">' + title + '</span>';
            return tag;
        };

        obj.createScaffoldEndTag = function() {
            var tag = '';
            tag = tag + '<span class="kfSupportEndMark">&nbsp; </span>';
            return tag;
        };

        obj.preProcess = function(body, toConnections, fromConnections) {
            var doc = '<div>' + body + '</div>';
            var jq = $(doc);

            jq.find('.KFSupportStart').addClass('mceNonEditable');
            elemLoop(jq.find('.KFSupportStart'), function(elem) {
                var ref = _.find(toConnections, function(conn) {
                    return conn._id === elem.id;
                });
                if (ref) {
                    elem.innerHTML = obj.createScaffoldStartTag(ref._from.title);
                } else {
                    elem.innerHTML = obj.createScaffoldStartTag('(missing link)');
                }
            });

            jq.find('.KFSupportEnd').addClass('mceNonEditable');
            elemLoop(jq.find('.KFSupportEnd'), function(elem) {
                elem.innerHTML = obj.createScaffoldEndTag();
            });

            jq.find('.KFReference').addClass('mceNonEditable');
            elemLoop(jq.find('.KFReference'), function(elem) {
                var ref = _.find(fromConnections, function(conn) {
                    return conn._id === elem.id;
                });
                if (ref) {
                    var text = '';
                    if (ref.data) {
                        text = ref.data.text;
                    }
                    elem.innerHTML = obj.createReferenceTag(ref.to, ref._to.title, ref._to.authors, text);
                } else {
                    elem.innerHTML = obj.createReferenceTag('', '(missing link)', '', '');
                }
            });
            return jq.html();
        };

        obj.postProcess = function(text, contributionId, toConnections, fromConnections, handler) {
            var doc = '<div>' + text + '</div>';
            var jq = $(doc);
            var todos = [];
            var endtags = {};
            var supportLinks = getLinks(toConnections, 'supports');
            var dSupportLinks = getLinks(toConnections, 'supports'); //TODO we need two to support duplication the algorithm problem         

            elemLoop(jq.find('.KFSupportStart'), function(elem) {
                elem.innerHTML = '';
                processOneElement(todos, elem, supportLinks, dSupportLinks, 'supports', elem.id, contributionId, endtags, {});
            });

            elemLoop(jq.find('.KFSupportEnd'), function(elem) {
                elem.innerHTML = '';
                var id = elem.id;
                endtags[id] = elem;
            });

            deleteLinks(todos, _.map(dSupportLinks));

            var referenceLinks = getLinks(fromConnections, 'references');
            var dReferenceLinks = getLinks(fromConnections, 'references');

            elemLoop(jq.find('.KFReference'), function(elem) {
                var data = {};
                data.text = $(elem).find('.KFReferenceText').html();
                elem.innerHTML = '';
                processOneElement(todos, elem, referenceLinks, dReferenceLinks, 'references', contributionId, elem.id, {}, data);
            });

            deleteLinks(todos, _.map(dReferenceLinks));

            processTodo(todos, handler, jq);
        };

        function processOneElement(todos, elem, links, deleteLinks, type, fromId, toId, endtags, data) {
            if (links[elem.id]) {
                delete deleteLinks[elem.id];
            } else {
                todos.push(function(handler) {
                    createLink(type, fromId, toId, data, function(link) {
                        if (!link) {
                            console.log('failure');
                            handler();
                            return;
                        }
                        var oldId = elem.id;
                        var newId = link._id;
                        elem.id = newId;
                        if (endtags[oldId]) {
                            endtags[oldId].id = newId;
                        }
                        handler();
                    });
                });
            }
        }

        function getLinks(sourceLinks, type) {
            var links = {};
            sourceLinks.forEach(function(each) {
                if (each.type === type) {
                    links[each._id] = each;
                }
            });
            return links;
        }

        function deleteLinks(todos, links) {
            links.forEach(function(each) {
                todos.push(function(handler) {
                    $http.delete('/api/links/' + each._id).success(function() {
                        handler();
                    }).error(function() {
                        handler();
                    });
                });
            });
        }

        function createLink(type, fromId, toId, data, handler) {
            var refObj = {};
            refObj.from = fromId;
            refObj.to = toId;
            refObj.type = type;
            refObj.data = data;
            $http.post('/api/links', refObj).success(function(ref) {
                handler(ref);
            }).error(function() {
                handler();
            });
        }

        function processTodo(todos, handler, jq) {
            var len = todos.length;
            var numFinished = 0;
            if (len <= 0) {
                handler(jq);
                return;
            }
            todos.forEach(function(func) {
                func(function() {
                    numFinished++;
                    if (numFinished >= len) {
                        handler(jq);
                    }
                });
            });
        }

        function elemLoop(jq, func) {
            var len = jq.size();
            for (var i = 0; i < len; i++) {
                var elem = jq.get(i);
                func(elem);
            }
        }

        return obj;
    });