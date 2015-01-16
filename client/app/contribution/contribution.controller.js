/* jshint camelcase: false */
/* jshint unused: false */
/* global tinymce */

'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope, $http, $community, $kftag, $stateParams, Auth) {
        var contributionId = $stateParams.contributionId;

        $scope.contribution = {};
        $scope.copy = {};
        $scope.authors = [];
        $scope.selected = {};
        $scope.records = [];
        $scope.communityMembers = [];
        $scope.toConnections = [];
        $scope.fromConnections = [];
        $scope.editActive = false;
        $scope.isAttachmentCollapsed = true;
        $scope.images = [];
        $scope.property = {};

        $http.get('/api/contributions/' + contributionId).success(function(contribution) {
            $scope.contribution = contribution;
            $scope.copy.body = contribution.body;
            $scope.property.isPublic = !contribution.permission || contribution.permission === 'public';
            $scope.property.isRiseabove = function() {
                return contribution.type === 'Note' && contribution.data && contribution.data.riseabove && contribution.data.riseabove.viewId;
            };
            $scope.prepareRiseabove();
            $community.enter($scope.contribution.communityId);
            window.contribution = contribution;
            $scope.contribution.authors.forEach(function(authorId) {
                $scope.authors.push($community.getMember(authorId));
            });
            window.setTimeout(function() {
                $http.post('/api/records/read/' + contributionId);
            }, 3000);
            $scope.updateRecords();
            $scope.communityMembers = $community.getMembersArray();
            $community.updateCommunityMembers();
            $scope.updateToConnections(function() {
                $scope.updateFromConnections(function(links) {
                    $scope.preProcess();
                    $scope.updateAttachments(links);
                });
            });
            if (Auth.isEditable($scope.contribution) && $scope.contribution.type !== 'Attachment') {
                $scope.editActive = true;
            }
        }).error(function() {});

        $scope.updateToConnections = function(next) {
            $http.get('/api/links/to/' + contributionId).success(function(links) {
                $scope.toConnections = links;
                if (next) {
                    next();
                }
            });
        };
        $scope.updateFromConnections = function(next) {
            $http.get('/api/links/from/' + contributionId).success(function(links) {
                $scope.fromConnections = links;
                if (next) {
                    next(links);
                }
            });
        };

        $scope.updateAttachments = function(links) {
            $scope.images = [];
            links.forEach(function(each) {
                if (each.type === 'attach') {
                    $http.get('/api/contributions/' + each.to).success(function(contribution) {
                        if ($scope.isImage(contribution)) {
                            $scope.images.push(contribution);
                        }
                    });
                }
            });
        };

        $scope.updateRecords = function() {
            $http.get('/api/contributions/records/' + contributionId).success(function(records) {
                $scope.records = records;
                $scope.records.forEach(function(record) {
                    record.user = $community.getMember(record.authorId);
                    record.getTime = function() {
                        var d = new Date(record.timestamp);
                        return d.toLocaleString();
                    };
                });
            });
        };

        $scope.addAuthor = function(author) {
            if (_.contains($scope.authors, author)) {
                window.alert('already included');
                return;
            }
            $scope.authors.push(author);
        };

        $scope.removeAuthor = function(author) {
            var index = $scope.authors.indexOf(author);
            if (index === 0) {
                window.alert('cannot remove the Primary Author');
                return;
            }
            if (index >= 0) {
                $scope.authors.splice(index, 1);
            }
        };

        $scope.contribute = function() {
            var cont = $scope.contribution;
            cont.authors = _.pluck($scope.authors, '_id');
            if ($scope.property.isPublic) {
                cont.permission = 'public';
            } else {
                cont.permission = 'private';
            }

            if (cont.type === 'Note') {
                //$scope.note.body = tinymce.activeEditor.getContent();
                //tinymce.activeEditor.isNotDirty = true;
                $scope.postProcess($scope.copy.body, function(jq) {
                    cont.body = jq.html();
                    var text = jq.text();
                    cont.text4search = 'title(' + cont.title + ') ' + text;
                    $scope.sendContribute();
                });

                return;
            }
            if (cont.type === 'Drawing') {
                var wnd = document.getElementById('svgedit').contentWindow;
                wnd.svgEditor.canvas.setResolution('fit', 100);
                cont.svg = wnd.svgCanvas.svgCanvasToString();
                wnd.svgEditor.showSaveWarning = false;
            }

            $scope.sendContribute();
        };

        $scope.sendContribute = function() {
            $http.put('/api/contributions/' + contributionId, $scope.contribution).success(function() {}).error(function() {});
        };

        function elemLoop(jq, func) {
            var len = jq.size();
            for (var i = 0; i < len; i++) {
                var elem = jq.get(i);
                func(elem);
            }
        }

        $scope.preProcess = function() {
            var doc = '<div>' + $scope.copy.body + '</div>';
            var jq = $(doc);

            jq.find('.KFSupportStart').addClass('mceNonEditable');
            elemLoop(jq.find('.KFSupportStart'), function(elem) {
                var ref = _.find($scope.toConnections, function(conn) {
                    return conn._id === elem.id;
                });
                if (ref) {
                    elem.innerHTML = $kftag.createScaffoldStartTag(ref.titleFrom);
                } else {
                    elem.innerHTML = $kftag.createScaffoldStartTag('(missing link)');
                }
            });

            jq.find('.KFSupportEnd').addClass('mceNonEditable');
            elemLoop(jq.find('.KFSupportEnd'), function(elem) {
                elem.innerHTML = $kftag.createScaffoldEndTag();
            });

            jq.find('.KFReference').addClass('mceNonEditable');
            elemLoop(jq.find('.KFReference'), function(elem) {
                var ref = _.find($scope.fromConnections, function(conn) {
                    return conn._id === elem.id;
                });
                if (ref) {
                    var text = '';
                    if (ref.data) {
                        text = ref.data.text;
                    }
                    elem.innerHTML = $kftag.createReferenceTag(ref.to, ref.titleTo, ref.authorsTo, text);
                } else {
                    elem.innerHTML = $kftag.createReferenceTag('', '(missing link)', '', '');
                }
            });
            $scope.copy.body = jq.html();
        };

        $scope.postProcess = function(text, handler) {
            var doc = '<div>' + text + '</div>';
            var jq = $(doc);
            var todos = [];
            var endtags = {};
            var supportLinks = getLinks($scope.toConnections, 'supports');
            var dSupportLinks = getLinks($scope.toConnections, 'supports'); //TODO we need two to support duplication the algorithm problem         

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

            var referenceLinks = getLinks($scope.fromConnections, 'references');
            var dReferenceLinks = getLinks($scope.fromConnections, 'references');

            elemLoop(jq.find('.KFReference'), function(elem) {
                var data = {};
                data.text = $(elem).find('.KFReferenceText').html();
                elem.innerHTML = '';
                processOneElement(todos, elem, referenceLinks, dReferenceLinks, 'references', contributionId, elem.id, {}, data);
            });

            deleteLinks(todos, _.map(dReferenceLinks));

            processTodo(todos, function() {
                handler(jq);
                // not effecient
                // we need a way of to reflect changes to the copy text
                $scope.updateToConnections();
                $scope.updateFromConnections();
            });
        };

        function processOneElement(todos, elem, links, deleteLinks, type, fromId, toId, endtags, data) {
            if (links[elem.id]) {
                delete deleteLinks[elem.id];
            } else {
                todos.push(function(handler) {
                    $scope.createLink(type, fromId, toId, data, function(link) {
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

        $scope.createLink = function(type, fromId, toId, data, handler) {
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
        };

        function processTodo(todos, handler) {
            var len = todos.length;
            var numFinished = 0;
            if (len <= 0) {
                handler();
                return;
            }
            todos.forEach(function(func) {
                func(function() {
                    numFinished++;
                    if (numFinished >= len) {
                        handler();
                    }
                });
            });
        }

        $scope.buildson = function() {
            $community.createNoteOn($scope.contribution._id, function(newContribution) {
                var url = './contribution/' + newContribution._id;
                window.location = url;
            });
        };

        $scope.makeRiseabove = function() {
            $community.createView('riseabove:' + $scope.contribution._id, function(view) {
                var riseabove = {
                    viewId: view._id
                };
                if (!$scope.contribution.data) {
                    $scope.contribution.data = {};
                }
                $scope.contribution.data.riseabove = riseabove;
                $scope.contribute();
                $scope.prepareRiseabove();
            }, true);
        };

        $scope.prepareRiseabove = function() {
            if ($scope.property.isRiseabove()) {
                var url = 'view/' + $scope.contribution.data.riseabove.viewId;
                var xhtml = '<iframe style="display: block;" height="500px" width="100%" src="%SRC%" ></iframe>';
                xhtml = xhtml.replace('%SRC%', url);
                $('#riseabovediv').html(xhtml);
            }
        };

        $scope.attachmentUpdated = function(attachment) {
            $http.post('/api/links', {
                from: $scope.contribution._id,
                to: attachment._id,
                type: 'attach'
            }).success(function() {
                $scope.updateFromConnections($scope.updateAttachments);
            });
        };

        $scope.isImage = function(attachment) {
            if (attachment.mime === undefined) {
                return false;
            }
            return attachment.mime.indexOf('image/') === 0;
        };

        /*********** tinymce ************/

        $scope.mcesetupHandler = function(ed) {
            // ed.on('change', function(e) {
            //     //do dirty status management
            //     //console.log('changed');
            // });
            ed.on('dragover', function(e) {
                // important to keep caret
                e.preventDefault();
                e.stopPropagation();
                ed.focus();
            });
            ed.on('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var data = e.dataTransfer.getData('text/html');
                tinymce.execCommand('mceInsertContent', true, data);
            });
        };

        $scope.tinymceOptions = {
            theme: 'modern',
            menubar: false,
            statusbar: false,
            plugins: ['advlist autolink autosave link image lists charmap print preview hr anchor pagebreak spellchecker searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking table directionality emoticons template textcolor paste textcolor noneditable fullpage'],
            toolbar: 'undo redo formatselect fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | forecolor backcolor bullist numlist link image code',
            //toolbar1: 'undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
            //toolbar2: 'forecolor backcolor | emotions link unlink image media | code | styleselect fontselect fontsizeselect',
            forced_root_block: false,
            force_br_newlines: true,
            force_p_newlines: false,
            extended_valid_elements: 'kf-*[*]',
            custom_elements: '~kf-[a-zA-Z0-9]+$',
            toolbar_items_size: 'small',
            content_css: '/app/kf.css,/app/kfmce.css',
            inline_styles: true,
            //setup: function(ed){}// dont use this, angular plugin use this.
            init_instance_callback: $scope.mcesetupHandler
        };

        $scope.addSupport = function(supportRef) {
            var id = supportRef.to;
            var title = supportRef.titleTo;
            var tag = $kftag.createNewScaffoldTag(id, title);
            tinymce.activeEditor.insertContent(tag);
        };

        /*********** svg-edit ************/
        $scope.svgInitialized = false;

        $scope.editSelected = function() {
            if ($scope.svgInitialized === false && $scope.contribution.type === 'Drawing') {
                var xhtml = '<iframe style="display: block;" id="svgedit" height="500px" width="100%" src="manual_components/svg-edit-2.7/svg-editor.html" onload="onSvgInitialized();"></iframe>';
                $('#svgeditdiv').html(xhtml);
                $scope.svgInitialized = true;
            }
        };
    });

function onSvgInitialized() {
    //console.log('svg initialized');
    var wnd = document.getElementById('svgedit').contentWindow;
    var doc = wnd.document;
    var mainButton = doc.getElementById('main_button');
    mainButton.style.display = 'none';
    //var svg = '<svg width="100%" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1<\/title><rect stroke-width="5" stroke="#000000" fill="#FF0000" id="svg_1" height="35" width="51" y="35" x="32"/><ellipse ry="15" rx="24" stroke-width="5" stroke="#000000" fill="#0000ff" id="svg_2" cy="60" cx="66"/><\/g><\/svg>';
    var svg = '';
    if (window.contribution) {
        svg = window.contribution.svg;
    }
    //console.log(svg);
    wnd.svgCanvas.setSvgString(svg);
    wnd.svgEditor.showSaveWarning = false;
}