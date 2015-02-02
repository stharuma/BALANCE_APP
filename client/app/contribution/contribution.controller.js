/* jshint camelcase: false */
/* jshint unused: false */
/* global tinymce */

'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope, $http, $community, $kftag, $stateParams, Auth, $ac) {
        var contributionId = $stateParams.contributionId;

        $ac.mixIn($scope, null);
        $scope.isContributionCollapsed = true;
        $scope.contributionStatus = '';
        $scope.recoverable = false;
        $scope.dirty = true;
        $scope.initializing = 'true';

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
            if (window.localStorage) {
                var item = window.localStorage.getItem('kfdoc');
                if (item) {
                    $scope.recoverable = true;
                }
            }
            if (!contribution.data) {
                contribution.data = {};
            }
            $scope.contribution = contribution;
            $scope.$watch('contribution.title', function() {
                $scope.updateDirtyStatus();
            });
            if ($scope.contribution.keywords) {
                var keywordsStr = '';
                $scope.contribution.keywords.forEach(function(keyword) {
                    if (keywordsStr.length !== 0) {
                        keywordsStr += '; ';
                    }
                    keywordsStr += keyword;
                });
                $scope.copy.keywords = keywordsStr;
            }
            $scope.$watch('copy.keywords', function() {
                $scope.updateDirtyStatus();
            });
            $ac.mixIn($scope, contribution);
            $scope.copy.body = contribution.data.body;
            $scope.$watch('copy.body', function() {
                if ($scope.mceEditor) {
                    $scope.updateDirtyStatus();
                }
            });
            $scope.property.isPublic = !contribution.permission || contribution.permission === 'public';
            $scope.$watch('property.isPublic', function() {
                $scope.updateDirtyStatus();
            });
            $scope.property.isRiseabove = function() {
                return contribution.type === 'Note' && contribution.data && contribution.data.riseabove && contribution.data.riseabove.viewId;
            };
            $scope.$watch('property.isRiseabove', function() {
                $scope.updateDirtyStatus();
            });
            $scope.prepareRiseabove();
            $community.enter($scope.contribution.communityId);
            window.contribution = contribution;
            $scope.contribution.authors.forEach(function(authorId) {
                $scope.authors.push($community.getMember(authorId));
            });
            $scope.$watch('authors', function() {
                $scope.updateDirtyStatus();
            }, true);
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
        }).error(function(msg) {
            console.log('error');
            console.log(msg);
        });

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
                        return $scope.getTimeString(record.timestamp);
                    };
                });
            });
        };

        $scope.getTimeString = function(time) {
            var d = new Date(time);
            return d.toLocaleString();
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

            if (cont.title.length === 0 || cont.title === 'New Note') {
                window.alert('You must input the title.');
                return;
            }

            $scope.isContributionCollapsed = false;
            $scope.contributionStatus = 'saving';

            cont.authors = _.pluck($scope.authors, '_id');
            if ($scope.property.isPublic) {
                cont.permission = 'public';
            } else {
                cont.permission = 'private';
            }

            $scope.contribution.keywords = [];
            if ($scope.copy.keywords) {
                var keywordsArray = $scope.copy.keywords.split(';');
                keywordsArray.forEach(function(keyword) {
                    var word = keyword.trim();
                    if (word.length <= 0) {
                        return;
                    }
                    $scope.contribution.keywords.push(word);
                });
            }

            if (cont.type === 'Note') {
                //$scope.note.body = tinymce.activeEditor.getContent();
                //tinymce.activeEditor.isNotDirty = true;
                cont.status = 'active';
                $scope.postProcess($scope.copy.body, function(jq) {
                    cont.data.body = jq.html();
                    var text = jq.text();
                    cont.text4search = '( ' + cont.title + ' ) ' + text + ' ( ' + $scope.copy.keywords + ' )';
                    $scope.sendContribute();
                });

                return;
            }
            if (cont.type === 'Drawing') {
                cont.status = 'active';
                var wnd = document.getElementById('svgedit').contentWindow;
                wnd.svgEditor.canvas.setResolution('fit', 100);
                if (!cont.data) {
                    cont.data = {};
                }
                cont.data.svg = wnd.svgCanvas.svgCanvasToString();
                wnd.svgEditor.showSaveWarning = false;
            }

            $scope.sendContribute();
        };

        $scope.sendContribute = function() {
            $http.put('/api/contributions/' + contributionId, $scope.contribution).success(function() {
                if ($scope.contribution.type === 'Note') {
                    $scope.dirty = false;
                }
                $scope.contributionStatus = 'success';
            }).error(function() {
                $scope.contributionStatus = 'failure';
                if (window.localStorage) {
                    window.localStorage.setItem('kfdoc', $scope.copy.body);
                    $scope.contributionStatus = 'stored';
                }
            });
        };

        $scope.recover = function() {
            if (window.localStorage) {
                var item = window.localStorage.getItem('kfdoc');
                if (item) {
                    $scope.copy.body = item;
                }
            }
        };

        $scope.closeRequest = function() {
            if (window.wid) {
                window.parent.closeDialog(window.wid);
            } else {
                window.close();
            }
        };

        $scope.preProcess = function() {
            $scope.copy.body = $kftag.preProcess($scope.copy.body, $scope.toConnections, $scope.fromConnections);
            $scope.initializing = false;
        };

        $scope.postProcess = function(text, handler) {
            $kftag.postProcess(text, contributionId, $scope.toConnections, $scope.fromConnections,
                function(jq) {
                    handler(jq);
                    // not effecient
                    // we need a way of to reflect changes to the copy text
                    $scope.updateToConnections();
                    $scope.updateFromConnections();
                });
        };

        $scope.updateDirtyStatus = function() {
            if (!$scope.isEditable()) {
                $scope.dirty = false;
                return;
            }
            if ($scope.contribution.type !== 'Note') {
                $scope.dirty = true;
                return;
            }
            if ($scope.initializing === 'true') {
                $scope.dirty = false;
                return;
            }
            $scope.dirty = true;
        };

        $(window).bind('beforeunload', function(e) {
            if ($scope.dirty && $scope.contribution.type === 'Note') {
                return 'The contribution is not contributed. Are you sure to leave?';
            }
            return;
        });

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
                var url = 'view/' + $scope.contribution.data.riseabove.viewId + '/X';
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
            if (!attachment.data || !attachment.data.type) {
                return false;
            }
            return attachment.data.type.indexOf('image/') === 0;
        };

        $scope.downloadAttachment = function(attachment) {
            window.location = attachment.data.url;
        };

        /*********** tinymce ************/

        $scope.mcesetupHandler = function(ed) {
            $scope.mceEditor = ed;
            $scope.mceResize();
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

        $scope.mceResize = function() {
            if ($scope.mceEditor) {
                var height = ($(window).height() - 150) * 0.8;
                $scope.mceEditor.theme.resizeTo('100%', height);
            }
        };

        window.onresize = $scope.mceResize;

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
            content_css: '/manual_assets/kfmce.css',
            inline_styles: true,
            //setup: function(ed){}// dont use this, angular plugin use this.
            init_instance_callback: $scope.mcesetupHandler
        };

        $scope.addSupport = function(supportRef) {
            if (!$scope.mceEditor) {
                window.alert('$scope.mceEditor is not set.');
                return;
            }
            var id = supportRef.to;
            var title = supportRef._to.title;
            var tag = $kftag.createNewScaffoldTag(id, title);
            $scope.mceEditor.insertContent(tag);
        };

        $scope.addKeyword = function() {
            if (!$scope.mceEditor) {
                window.alert('$scope.mceEditor is not set.');
                return;
            }

            var selectedText = $scope.mceEditor.selection.getContent();
            if (!selectedText) {
                window.alert('You need to select word(s) in the editor.');
                return;
            }

            var original = $scope.copy.keywords;
            if (original && original.length >= 0) {
                original += '; ';
            }
            $scope.copy.keywords = original + selectedText;
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
        svg = window.contribution.data.svg;
    }
    //console.log(svg);
    wnd.svgCanvas.setSvgString(svg);
    wnd.svgEditor.showSaveWarning = false;
}