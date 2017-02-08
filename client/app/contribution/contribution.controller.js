/* jshint camelcase: false */
/* jshint unused: false */
/* global tinymce */

'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope, $rootScope, $http, $community, $kftag, $stateParams, $ac, $timeout, $kfutil, $translate, $sce, $suresh) {
        var contributionId = $rootScope.contributionId;
        var contextId = $rootScope.contextId;

        $scope.relatedwordID = contributionId; //added by Xing Liu

        $ac.mixIn($scope, null);
        $kfutil.mixIn($scope);

        $scope.status = {};
        $scope.status.error = false;
        $scope.status.isScaffoldCollapsed = false;
        $scope.status.isAttachmentsCollapsed = true;
        $scope.status.isContributionCollapsed = true;
        $scope.status.ispromisingideaCollapsed = true;
        $scope.status.ispromisingideaTabDisplayed = false;
        $scope.showpromisingideaCollapsed = false;
        $scope.status.isInsertImgCollapsed = false;
        $scope.status.edittabActive = false;
        $scope.status.dirty = true;
        $scope.status.contribution = '';
        $scope.status.initializing = 'true';
        $scope.status.recoverable = false;

        $scope.promisingmsg = 'ShowPromisingIdea';

        $scope.selectedIndex = -1;
        $scope.newnoteIndex = -1;
        $scope.deletedIndex = -1;

        $scope.status.insertable = false;

        $scope.community = {};
        $scope.contribution = {};
        $scope.copy = {};
        $scope.authors = [];
        $scope.records = [];
        $scope.toConnections = [];
        $scope.fromConnections = [];
        $scope.communityMembers = [];
        $scope.images = [];
        $scope.selected = {};

        $scope.selectedText = '';
        $scope.targetColor = '';
        $scope.textareaText = '';
        $scope.promisingIdeaobjs = {};
        $scope.promisingIdeaobjLinks = {};
        $scope.selectedViewIds = [];
        $scope.promisingnoteTitle = '';

        $scope.preContributeHooks = [];
        $scope.initializingHooks = [];
        $scope.initializingHookInvoked = false;
        $scope.colors =$suresh.promisingcolors();
        $scope.promisingColorData=[];
        $scope.promisingIdeacolorobjsarr=[];

        $community.getObject(contributionId, function(contribution) {
            if (window.localStorage) {
                var item = window.localStorage.getItem('kfdoc');
                if (item) {
                    $scope.status.recoverable = true;
                }
            }
            if (!contribution.data) {
                contribution.data = {};
            }
            $scope.contribution = contribution;
            $community.enter($scope.contribution.communityId, function() {
                $scope.community = $community.getCommunityData();
                var communityId = $community.getCommunityData().community._id;
                $community.refreshContext(contextId, function(context) {
                    $community.getContext(null, function(context) {
                        $scope.context = context;
                    });
                    $scope.initializingHookInvoked = true;
                    $scope.initializingHooks.forEach(function(func) {
                        func();
                    });
                });
                $scope.updateTitle();
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
                $ac.mixIn($scope, contribution);
                $scope.copy.body = contribution.data.body;
                $scope.contribution.isRiseabove = function() {
                    return contribution.type === 'Note' && contribution.data && contribution.data.riseabove && contribution.data.riseabove.viewId;
                };
                $scope.prepareRiseabove();
                window.contribution = contribution;
                $scope.initializeDirtyStatusHandlers();

                $scope.contribution.authors.forEach(function(authorId) {
                    $scope.authors.push($community.getMember(authorId));
                });

                // $scope.contribution.getGroupName = function() {
                //     var groupId = $scope.contribution.group;
                //     if (!groupId) {
                //         return '(none)';
                //     }
                //     var group = $scope.community.groups[groupId];
                //     if (!group) {
                //         return groupId + ' (loading)';
                //     }
                //     return group.title;
                // };
                // $scope.selected.group = $community.getGroup($scope.contribution.group);
                // $scope.$watch('selected.group', function() {
                //     if ($scope.selected.group) {
                //         $scope.contribution.group = $scope.selected.group._id;
                //     }
                // });
                // $community.refreshGroups();
                $community.refreshPromisingcolorobjs(function(){
                   $scope.promisingIdeacolorobjsarr=$community.getPromisingcolorobjsArray();
                    $scope.setPromisingColorData();
                });
                if($scope.promisingIdeacolorobjsarr.length===0){
                   $scope.setPromisingColorData();
                }

                $scope.updateToConnections(function() {
                    $scope.updateAnnotations();
                    $scope.updatepromisingIdeaobjs();
                    $scope.updateFromConnections(function(links) {
                        $scope.preProcess();
                        $scope.updateAttachments(links);
                    });
                });

                // $scope.updateRecords();
                // $scope.communityMembers = $community.getMembersArray();
                // $community.refreshMembers();
                // Open a contribution in "edit" mode only it is new (status "unsaved") and obviously if the author has the right to edit it.
                if ($scope.contribution.status === "unsaved" && $scope.isEditable() && $scope.contribution.type !== 'Attachment' && !$scope.contribution.isRiseabove()) {
                    $scope.status.edittabActive = true;
                }
                if ($scope.contribution.status === 'active') {
                    window.setTimeout(function() {
                        $community.read($scope.contribution);
                    }, 1200);
                }
            });
        }, function(msg, status) {
            $scope.status.error = true;
            $scope.status.errorMessage = msg;
        });

        $scope.initializeDirtyStatusHandlers = function() {
            $scope.$watch('contribution.title', function() {
                $scope.updateDirtyStatus();
            });
            $scope.$watch('copy.keywords', function() {
                $scope.updateDirtyStatus();
            });
            $scope.$watch('copy.body', function() {
                if ($scope.mceEditor) {
                    $scope.updateDirtyStatus();
                }
            });
            $scope.$watch('contribution.permission', function() {
                $scope.updateDirtyStatus();
            });
            $scope.$watch('contribution.isRiseabove', function() {
                $scope.updateDirtyStatus();
            });
            $scope.$watch('authors', function() {
                $scope.updateDirtyStatus();
            }, true);
        };

        $scope.getAuthorString = function() {
            return $community.makeAuthorString($scope.authors);
        };

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
                    $community.getObject(each.to, function(contribution) {
                        if ($scope.isImage(contribution)) {
                            $scope.images.push(contribution);
                        }
                    });
                }
            });
        };

        $scope.updateRecords = function() {
            $http.get('/api/records/object/' + contributionId).success(function(records) {
                $scope.records = records;
                $scope.records.forEach(function(record) {
                    record.user = $community.getMember(record.authorId);
                    record.getTime = function() {
                        return $scope.getTimeString(record.timestamp);
                    };
                });
            });
        };

        $scope.authorSelected = function(author) {
            if (_.includes($scope.authors, author)) {
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

            if (cont.title.length === 0 || cont.title === '') {
                $translate('title_required').then(function(translation) {
                    window.alert(translation);
                }, function(translationId) {
                    // TODO do something if unable to provide translation
                });
                return;
            }

            if (cont.type === 'Note' && !$scope.mceEditor) { //avoid contribution in empty body
                window.alert('mceEditor have not initialized yet.');
                return;
            }

            $scope.status.isContributionCollapsed = false;
            $scope.status.contribution = 'saving';

            $scope.preContributeHooks.forEach(function(each) {
                each();
            });

            cont.authors = _.map($scope.authors, '_id');

            if ($scope.copy.keywords) {
                $scope.contribution.keywords = [];
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
            $community.modifyObject($scope.contribution, function() {
                if ($scope.contribution.type === 'Note') {
                    $scope.status.dirty = false;
                }
                $scope.status.contribution = 'success';
                /* contributor should be a first reader */
                $community.read($scope.contribution);
                /* notification */
                if ($scope.contribution.type === 'Note') {
                    $community.notify($scope.contribution, contextId);
                }
            }, function() {
                $scope.status.contribution = 'failure';
                if (window.localStorage) {
                    window.localStorage.setItem('kfdoc', $scope.copy.body);
                    $scope.status.contribution = 'stored';
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

        $scope.insertImg = function(){
            var parentDOM = document.getElementsByClassName("KFContainer")[0];
            var selectedImgs = parentDOM.getElementsByClassName("selected");
            if(selectedImgs.length == 0){
                return;
            }
            var html = "";
            for(var i = 0 ; i< selectedImgs.length; i++){
                html += "<img src=\""+selectedImgs[i].src+"\" alt=\"\" width=\"50px\" height=\"50px\" data-mce-src=\""+selectedImgs[i].src+"\">";
            }
            $scope.insertText(html);
        };

        $scope.closeRequest = function() {
            // if (window.wid) {
            //     window.parent.closeDialog(window.wid);
            // } else {
            //     window.close();
            // }
            window.closeDialog('ctrb_window_'+contributionId);
        };

        $scope.preProcess = function() {
            $scope.copy.body = $kftag.preProcess($scope.copy.body, $scope.toConnections, $scope.fromConnections);
            $scope.status.initializing = false;
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
                $scope.status.dirty = false;
                return;
            }
            if ($scope.contribution.type !== 'Note') {
                $scope.status.dirty = true;
                return;
            }
            if ($scope.status.initializing === 'true') {
                $scope.status.dirty = false;
                return;
            }
            $scope.status.dirty = true;
        };

        $(window).bind('beforeunload', function(e) {
            if ($scope.status.dirty && $scope.contribution.type === 'Note') {
                return 'The contribution is not contributed. Are you sure to leave?';
            }
            return;
        });

        $scope.buildson = function() {
            var w;
            if ($scope.isMobile()) {
                w = window.open('');
            }
            var mode = {};
            mode.permission = $scope.contribution.permission;
            mode.group = $scope.contribution.group;
            $community.createNoteOn(mode, $scope.contribution._id, function(newContribution) {
                var url = './contribution/' + newContribution._id;
                if (w) {
                    w.location.href = url;
                } else if (window.openContribution) {
                    window.openContribution(newContribution._id);
                } else {
                    window.open(url, '_blank');
                }
            });
        };

        $scope.makeFromTemplate = function() {
            var templateBody = $scope.copy.body;
            templateBody = $kftag.processTemplate(templateBody, $scope.toConnections);

            /* here is a copy of making builds on (merge later) */
            var w;
            if ($scope.isMobile()) {
                w = window.open('');
            }
            var mode = {};
            mode.permission = $scope.contribution.permission;
            mode.group = $scope.contribution.group;
            $community.createNote(mode, function(newContribution) {
                var url = './contribution/' + newContribution._id;
                if (w) {
                    w.location.href = url;
                } else if (window.openContribution) {
                    window.openContribution(newContribution._id);
                } else {
                    window.open(url, '_blank');
                }
                /* get context does not work -- need refactoring */
                if (contextId) {
                    $community.getObject(contextId, function(view) {
                        if (view.type === 'View') {
                            $community.getLinksFromTo(view._id, $scope.contribution._id, 'contains', function(links) {
                                if (!links || links.length === 0) {
                                    return;
                                }
                                var link = links[0];
                                console.log(link);
                                var data = { x: link.data.x + 100, y: link.data.y + 100 };
                                $community.createLink(view._id, newContribution._id, 'contains', data, function() {
                                    $community.createLink(newContribution._id, $scope.contribution._id, 'buildson', {}, function() {});
                                });
                            });
                        }
                    });
                }
            }, templateBody);
            /* copy end */
        };

        $scope.makeRiseabove = function() {
            var mode = {};
            mode.permission = $scope.contribution.permission;
            mode.group = $scope.contribution.group;
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
            }, true, mode);
        };

        $scope.prepareRiseabove = function() {
            if ($scope.contribution.isRiseabove()) {
                var url = 'view/' + $scope.contribution.data.riseabove.viewId + '/X';
                var xhtml = '<iframe style="display: block;" height="100%" width="100%" src="%SRC%" ></iframe>';
                xhtml = xhtml.replace('%SRC%', url);
                $('#riseabovediv').html(xhtml);
            }
        };

        $scope.openRiseaboveView = function() {
            if (!$scope.contribution.isRiseabove()) {
                window.alert('this contribution is not riseabove');
            }

            var url = 'view/' + $scope.contribution.data.riseabove.viewId;
            window.open(url, '_blank');
        };

        $scope.attachmentUploaded = function(attachment) {
            $http.post('/api/links', {
                from: $scope.contribution._id,
                to: attachment._id,
                type: 'attach'
            }).success(function() {
                $scope.updateFromConnections($scope.updateAttachments);
                $timeout(function() {
                    $scope.status.isAttachmentCollapsed = true;
                }, 500);
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

        $scope.deleteAttachment = function(link) {
            if (window.confirm('Are you sure to delete the attachment?')) {
                if (window.confirm('Are you OK to contribute this change?')) {
                    $community.deleteLink(link, function() {
                        $scope.contribute();
                    });
                }
            }
        };

        /*********** tab changed handler ************/

        // $scope.readSelected = function() {
        //     $scope.status.hidebuildson = false;
        // };

        $scope.readDeselected = function() {
            $scope.status.hidebuildson = true;
        };

        /*********** title ************/

        $scope.updateTitle = function() {
            if (window.setInternalWindowTitle) { //Internal
                if ($scope.contribution.type === 'View') {
                    window.setInternalWindowTitle('View Property');
                } else {
                    //Susana doesnt like to put title here.
                }
            } else { //External
                var title = '*';
                title = $scope.contribution.type + ': ' + $scope.contribution.title;
                document.title = title;
            }
        };

        /*********** DnD Reference Related ************/
        $scope.kfdragstart = function(e) {
            var dt = e.dataTransfer; //error in IE
            if (!dt && $kfutil.isIE()) {
                window.alert('Sorry, making reference function doesn\'t work on IE');
                return; //surrender to create reference
            }
            var original = dt.getData('text/plain');
            if (!original && $kfutil.isSafari()) {
                original = getSelected();
            }
            var contrib = $scope.contribution;
            var html = $kftag.createNewReferenceTag(contrib._id, contrib.title, contrib.authors, original);
            dt.setData('kf', 'true');
            dt.setData('kfid', $scope.contribution._id);
            dt.setData('text/html', html);
            dt.setData('text/plain', original);
        };
        $scope.kfcopy = function(e) {
            var dt = e.clipboardData; //error in IE
            if (!dt && $kfutil.isIE()) {
                window.alert('Sorry, making reference function doesn\'t work on IE');
                return; //surrender to create reference
            }
            var original = getSelected();
            var contrib = $scope.contribution;
            var html = $kftag.createNewReferenceTag(contrib._id, contrib.title, contrib.authors, original);
            dt.setData('kf', 'true');
            dt.setData('kfid', $scope.contribution._id);
            dt.setData('text/html', html);
            dt.setData('text/plain', original);
            e.stopPropagation();
            e.preventDefault();
        };

        //http://stackoverflow.com/questions/5643635/how-to-get-selected-html-text-with-javascript
        function getSelected() {
            var text = '';
            if ($scope.status.edittabActive && tinymce.activeEditor.selection) {
                return tinymce.activeEditor.selection.getContent();
            } else if (window.getSelection && window.getSelection().toString() && $(window.getSelection()).attr('type') !== 'Caret') {
                text = window.getSelection().toString();
                return text;
            } else if (document.getSelection && document.getSelection().toString() && $(document.getSelection()).attr('type') !== 'Caret') {
                text = window.getSelection().toString();
                return text;
            } else {
                var selection = document.selection && document.selection.createRange();
                if ((typeof selection !== 'undefined') && selection.text && selection.text.toString()) {
                    text = selection.text;
                    return text;
                }
            }
            return false;
        }

        /*********** tinymce ************/
        $scope.mcesetupHandler = function(ed) {
            $scope.mceEditor = ed;
            $scope.mceResize();

            ed.on('dragover', function(e) {
                // important to keep caret
                // this was workable 4.0.0 but cannot keep caret on 4.1.7
                e.preventDefault();
                e.stopPropagation();
                ed.focus();
            });
            ed.on('dragstart', $scope.kfdragstart);
            ed.on('copy', $scope.kfcopy);
        };

        $scope.mceResize = function() {
            if ($scope.mceEditor) {
                var height = ($('#ctrb_window_'+contributionId).height() - 140);
                $scope.mceEditor.theme.resizeTo('100%', height);
            }
        };

        $('#ctrb_window_'+contributionId).onresize = $scope.mceResize;

        var currentLang = $translate.proposedLanguage() || $translate.use();
        var languageURL = "";
        if (currentLang === 'en') {
            languageURL = "";
        } else {
            languageURL = "/manual_components/tinymce-langs/" + currentLang + ".js";
        }
        $scope.tinymceOptions = {
            language: currentLang,
            language_url: languageURL,
            theme: 'modern',
            menubar: false,
            statusbar: false,
            // TODO decide if internationalize or remove font size
            /*
            style_formats_merge: true,
            style_formats: [{
                title: 'Font Size',
                items: [{
                    title: '8pt',
                    inline: 'span',
                    styles: {
                        fontSize: '12px',
                        'font-size': '8px'
                    }
                }, {
                    title: '10pt',
                    inline: 'span',
                    styles: {
                        fontSize: '12px',
                        'font-size': '10px'
                    }
                }, {
                    title: '12pt',
                    inline: 'span',
                    styles: {
                        fontSize: '12px',
                        'font-size': '12px'
                    }
                }, {
                    title: '14pt',
                    inline: 'span',
                    styles: {
                        fontSize: '12px',
                        'font-size': '14px'
                    }
                }, {
                    title: '16pt',
                    inline: 'span',
                    styles: {
                        fontSize: '12px',
                        'font-size': '16px'
                    }
                }]
            }], */
            plugins: ['advlist autolink autosave link image lists charmap print preview hr anchor pagebreak spellchecker searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking table directionality emoticons template textcolor paste textcolor noneditable fullpage'],
            toolbar: 'styleselect | bold italic underline strikethrough | forecolor backcolor bullist numlist link | code',
            //toolbar: 'undo redo formatselect fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | forecolor backcolor bullist numlist link image code',
            //toolbar1: 'undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
            //toolbar2: 'forecolor backcolor | emotions link unlink image media | code | styleselect fontselect fontsizeselect',
            forced_root_block: false,
            force_br_newlines: true,
            force_p_newlines: false,
            toolbar_items_size: 'small',
            content_css: '/manual_assets/kfmce.css',
            inline_styles: true,
            //setup: function(ed){}// dont use this, angular plugin use this.
            init_instance_callback: $scope.mcesetupHandler
        };

        $scope.insertText = function(text) {
            if (!$scope.mceEditor) {
                window.alert('$scope.mceEditor is not set.');
                return;
            }
            $scope.mceEditor.insertContent(text);
        };

        /* supportLink means a contains link from Scaffold to Support */
        $scope.addSupport = function(supportLink, selection, addhyphen, argInitialText, isTemplate) {
            if (!$scope.mceEditor) {
                window.alert('$scope.mceEditor is not set.');
                return;
            }

            // choose text
            var initialText = '';
            if (argInitialText) {
                initialText = argInitialText;
            }
            var selected = $scope.mceEditor.selection.getContent();
            if (selected.length > 0) {
                initialText = selected;
            }
            // content tag for text selection after insert
            var supportContentId = new Date().getTime().toString();
            var contentTagStr = '<span id="' + supportContentId + '"></span>';

            var text = contentTagStr + initialText;
            if (addhyphen) {
                text = ' -&nbsp;' + text + '&nbsp;- ';
            }

            // insert
            var id = supportLink.to;
            var title = supportLink._to.title;
            var tag = $kftag.createNewScaffoldTag(id, title, text, isTemplate);
            $scope.mceEditor.insertContent(tag);

            // select text after insert
            if (selection) {
                var contentTag = $scope.mceEditor.dom.get(supportContentId);
                if (contentTag) {
                    $scope.mceEditor.selection.setCursorLocation(contentTag);
                }
            }
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

        $scope.selectedImg = function(){
            if($scope.images.length == 0){
                return;
            }
            event = event || window.event;
            var selectedImg = event.target || event.srcElement;
            if(selectedImg.className == ""){
                selectedImg.className = "selected";
                $scope.status.insertable = true;
            }
            else{
                selectedImg.className = "";
                var parentDOM = document.getElementsByClassName("KFContainer")[0];
                var selectedImgs = parentDOM.getElementsByClassName("selected");
                if(selectedImgs.length == 0){
                    $scope.status.insertable = false;
                }
            }
        };

        /*********** annotator ***********/
        var annotator;
        $scope.annotatorHandler = {};
        $scope.annos = {};
        $scope.annoLinks = {};
        $scope.annotatorHandler.annotatorInitialized = function(anAnnotator) {
            annotator = anAnnotator;
        };
        $scope.annotatorHandler.annotationCreated = function(annoVM) {
            createAnnotation(annoVM);
        };
        $scope.annotatorHandler.annotationUpdated = function(annoVM) {
            if (!annoVM.linkId || !annoVM.modelId) {
                console.error('ERROR! annoVM doesn\'t have id on update');
                return;
            }
            var model = $scope.annos[annoVM.modelId];
            if (!model) {
                console.error('ERROR! model couldn\'t find');
                return;
            }
            model.data = annoVM;
            vm2m(model);
            $community.modifyObject(model);
        };
        $scope.annotatorHandler.annotationDeleted = function(annoVM) {
            if (!annoVM.linkId || !annoVM.modelId) {
                console.error('ERROR! annoVM doesn\'t have id on delete');
                return;
            }
            $http.delete('/api/links/' + annoVM.linkId);
        };

        $scope.updateAnnotations = function() {
            if ($scope.contribution.type !== 'Note') {
                return;
            }
            if (!annotator) {
                console.error('annotator was not initialized');
                return;
            }
            window.setTimeout(function() {
                var annoLinks = $scope.toConnections.filter(function(each) {
                    return each.type === 'annotates';
                });
                annoLinks.forEach(function(annoLink) {
                    if (!$ac.isReadable(annoLink._from)) {
                        return;
                    }
                    $community.getObject(annoLink.from, function(anno) {
                        m2vm(anno);
                        $scope.annoLinks[annoLink._id] = annoLink;
                        $scope.annos[anno._id] = anno;
                        var annoVM = anno.data;
                        annoVM.linkId = annoLink._id;
                        annoVM.modelId = anno._id;
                        annotator.loadAnnotations([annoVM]);
                    });
                });
            }, 3000);
        };

        var createAnnotation = function(annoVM) {
            var communityId = $community.getCommunityData().community._id;
            var newobj = {
                communityId: communityId,
                type: 'Annotation',
                title: 'an Annotation',
                authors: [$community.getAuthor()._id],
                status: 'active',
                permission: 'private',
                data: annoVM
            };
            vm2m(newobj);
            $http.post('/api/contributions/' + communityId, newobj)
                .success(function(annotation) {
                    createAnnotationLink(annotation, annoVM);
                });
        };

        var vm2m = function(anno) {
            var isPublic = anno.data.permissions.read.length === 0;
            if (isPublic) {
                anno.permission = 'protected';
            } else {
                anno.permission = 'private';
            }
            var loc = anno.data.ranges[0];
            if (loc.start.indexOf('/div[1]') === 0) {
                loc.start = loc.start.substring(7);
            }
            if (loc.end.indexOf('/div[1]') === 0) {
                loc.end = loc.end.substring(7);
            }
            return anno;
        };

        var m2vm = function(anno) {
            var loc = anno.data.ranges[0];
            loc.start = '/div[1]' + loc.start;
            loc.end = '/div[1]' + loc.end;
            return anno;
        };

        var createAnnotationLink = function(annotation, annoVM) {
            var link = {};
            link.to = $scope.contribution._id;
            link.from = annotation._id;
            link.type = 'annotates';
            $http.post('/api/links', link).success(function(link) {
                annoVM.linkId = link._id;
                annoVM.modelId = annotation._id;
                $scope.annoLinks[link._id] = link;
                $scope.annos[annotation._id] = annotation;
            });
        };

       /***********promising Ideas ************/
          $scope.setIndex = function(index) {
            $scope.selectedIndex = index;
        };

        $scope.setnewnoteIndex = function(index) {
            $community.refreshViews();
            $scope.newnoteIndex = index;
        };

        $scope.promisingIdeaobjProcess = function() {
            $scope.promisingIdeaobj = {
                idea: $scope.selectedText,
                reason: $scope.textareaText,
                color: $scope.targetColor
            };
            $scope.createPromisngIdeaobj($scope.promisingIdeaobj);
            $scope.textareaText = '';
            $scope.selectedText = '';
        };

        $scope.trustAsHtml = function(html) {
            return $sce.trustAsHtml(html);
        };

        $scope.setSelectedText = function() {
            $scope.selectedText = $scope.getSelectionText();
        };

        $scope.getSelectionText = function() {
            var text = '';
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type !== 'Control') {
                text = document.selection.createRange().text;
            }
            return text;
        };

        $scope.getSelectionHtml = function() {
            var html = '';
            if (typeof window.getSelection !== 'undefined') {
                var sel = window.getSelection();
                if (sel.rangeCount) {
                    var container = document.createElement('div');
                    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                        container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerHTML;
                }
            } else if (typeof document.selection !== 'undefined') {
                if (document.selection.type === 'Text') {
                    html = document.selection.createRange().htmlText;
                }
            }
            return html;
        };

        $scope.createPromisngIdeaobj = function(promisingIdeaobj) {
            var communityId = $community.getCommunityData().community._id;
            var newobj = {
                communityId: communityId,
                type: 'promisingIdeaobj',
                title: 'an promisingIdeaobj',
                authors:$community.getAuthor()._id,
                created:new Date(),
                status: 'active',
                permission: 'protected',
                data: promisingIdeaobj
            };
            $http.post('/api/contributions/' + communityId, newobj)
                .success(function (promisingIdeaobj_) {
                    createpromisingIdeaobjLink(promisingIdeaobj_);
                });
        };

        var createpromisingIdeaobjLink = function(promisingIdeaobj) {
            var link = {};
            link.to = $scope.contribution._id;
            link.from = promisingIdeaobj._id;
            link.type = 'promisings';
            link.data = promisingIdeaobj.data;
            $http.post('/api/links', link).success(function(link) {
                $scope.promisingIdeaobjLinks[link._id] = link;
                $scope.promisingIdeaobjs[promisingIdeaobj._id] = promisingIdeaobj;
                $scope.toConnections.push(link);
                $scope.status.ispromisingideaTabDisplayed = true;
            });
        };

        $scope.promisingIdeaobjUpdated = function(promisingIdeaobjLink) {
            if (!promisingIdeaobjLink.to || !promisingIdeaobjLink.from) {
                console.error('ERROR! promisingIdeaobj doesn\'t have id on update');
                return;
            }
            var model = $scope.promisingIdeaobjs[promisingIdeaobjLink.from];
            if (!model) {
                console.error('ERROR! model couldn\'t find');
                return;
            }
            $community.modifyObject(model);
        };

        $scope.promisingIdeaobjDeleted = function(promisingIdeaobjLink) {
            if (!promisingIdeaobjLink.to || !promisingIdeaobjLink.from) {
                console.error('ERROR! promisingIdeaobj doesn\'t have id on delete');
                return;
            }
            $http.delete('/api/links/' + promisingIdeaobjLink._id);
        };

        $scope.updatepromisingIdeaobjs = function() {
            if ($scope.contribution.type !== 'Note') {
                return;
            }
            //   window.setTimeout(function() {
            var promisingIdeaobjLinks = $scope.toConnections.filter(function (each) {
                return each.type === 'promisings';
            });
            promisingIdeaobjLinks.forEach(function(promisingIdeaobjLink) {
                if (!$ac.isReadable(promisingIdeaobjLink._from)) {
                    return;
                }
                $community.getObject(promisingIdeaobjLink.from, function(promisingIdeaobj) {
                    $scope.promisingIdeaobjLinks[promisingIdeaobjLink._id] = promisingIdeaobjLink;
                    $scope.promisingIdeaobjs[promisingIdeaobj._id] = promisingIdeaobj;
                    $scope.status.ispromisingideaTabDisplayed = true;
                });
            });
            //  }, 1000);
        };

        $scope.viewSelected = function(view) {
            $scope.selectedViewIds.push(view._id);
        };


        $scope.makepromisingnote = function(title, body) {
            if (title === '') {
                window.alert('Note title is empty ');
                return;
            }
            if ($scope.selectedViewIds.length === 0) {
                window.alert('View is not selected');
                return;
            }

            body = $kftag.createNewReferenceTag($scope.contribution._id, $scope.contribution.title, $scope.contribution.authors, body);
            $suresh.createnewnoteInMutipleView(title, $scope.selectedViewIds, $community, body,true);
            $scope.selectedViewIds.length = 0;
            $scope.setnewnoteIndex(-1);
        };

        $scope.tabSelected = function(idx) {
            if(idx ==='edit'){
                if ($scope.svgInitialized === false && $scope.contribution.type === 'Drawing') {
                    var xhtml = '<iframe style="display: block;" id="svgedit" height="500px" width="100%" src="manual_components/svg-edit-2.8.1/svg-editor.html" onload="onSvgInitialized();"></iframe>';
                    $('#svgeditdiv').html(xhtml);
                    $scope.svgInitialized = true;
                }
            }
            else if(idx ==='authors'){
                $scope.contribution.getGroupName = function() {
                    var groupId = $scope.contribution.group;
                    if (!groupId) {
                        return '(none)';
                    }
                    var group = $scope.community.groups[groupId];
                    if (!group) {
                        return groupId + ' (loading)';
                    }
                    return group.title;
                };
                $scope.selected.group = $community.getGroup($scope.contribution.group);
                $scope.$watch('selected.group', function() {
                    if ($scope.selected.group) {
                        $scope.contribution.group = $scope.selected.group._id;
                    }
                });
                $community.refreshGroups();
                $community.refreshMembers();
                $scope.communityMembers = $community.getMembersArray();
            }
            else if(idx ==='connections'){

            }
            else if(idx ==='history'){
                $scope.updateRecords();
            }
            else if(idx ==='attachments'){

            }
            else if(idx ==='read'){
                $scope.status.hidebuildson = false;
            }
            
        };

         $scope.showPromisingInReadMode = function () {
             $scope.promisingmsg = 'ShowPromisingIdea';
             $scope.showpromisingideaCollapsed = !$scope.showpromisingideaCollapsed;
             if ($scope.showpromisingideaCollapsed) {
                 $scope.promisingmsg = 'HidePromisingIdea';
                 $scope.pbody = $scope.copy.body;
                 $scope.toConnections.forEach(function (conn) {
                     if (conn.type === 'promisings') {
                         var idea = conn.data.idea;
                         var bodytext = strip($scope.pbody).replace(/^\s+|\s+$/g, '').replace(/\s\s/g, '');
                         var color = $scope.promisingIdeaobjs[conn.from].data.color;
                         var bwords = getwords($scope.pbody);
                         var pwords = getwords(idea).filter(function (str) { //removed space array
                             return /\S/.test(str);
                         });
                         setpromisingidea_read(bodytext, bwords, pwords, idea, color);
                     }
                 });
             }
         };

         function strip(html) {
             var tmp = document.createElement("DIV");
             tmp.innerHTML = html;
             return (tmp.textContent || tmp.innerText || "");
         }

         function getwords(textContent) {
             return textContent.split(" ");
         }

         function setpromisingidea_read(bodytext, bwords, pwords, idea, color) {
             var str ='';
             var promisingindex = bodytext.replace(/\s/g, '').indexOf(idea.replace(/\s/g, ''));
             var textbeforepromising = bodytext.replace(/\s/g, '').substring(0, promisingindex - 1);
             var textafterpromising = bodytext.replace(/\s/g, '').substring(promisingindex + idea.replace(/\s/g, '').length, bodytext.replace(/\s/g, '').length);
             var firstinx = getfirstpromingindex(bwords, textbeforepromising, pwords, bodytext);
             var lastinx = getlastpromingindex(bwords, textafterpromising, pwords);
             var style = "style=\"font-weight: bold; color:black; background-color:" + color + "; \"";
             for (var i = firstinx; i < lastinx; i++) {
                 if (bwords[i].indexOf('<body>') !== -1) {
                     str = "<span " + style + " >" + pwords[0] + " " + "</span>";
                     bwords[i] = bwords[i].replace(pwords[0], str);
                 } else if (bwords[i].indexOf('</body>') !== -1) {
                     str = "<span " + style + " >" + pwords[pwords.length - 1] + " " + "</span>";
                     bwords[i] = bwords[i].replace(pwords[pwords.length - 1], str);
                 } else {
                     bwords[i] = setcolortochangedword(bwords[i], idea.replace(/\s/g, ''), style);
                 }
             }
             $scope.pbody = bwords.join(' ').toString();
         }

         function getfirstpromingindex(cwords, text, prewords) { //check again
             var fbody = '',
                 index = 0;
             if (text.replace(/\s/g, '').length !== 0) {
                 for (var k = 0; k < cwords.length; k++) {
                     fbody += cwords[k] + ' ';
                     if (strip(fbody).replace(/\s/g, '').indexOf(text) !== -1) {
                         index = k;
                         break;
                     }
                 }
             }
             return index;
         }

         function getlastpromingindex(cwords, text, prewords) {
             var fbody = '',
                 index = cwords.length;
             if (text.replace(/\s/g, '').length !== 0) {
                 for (var k = cwords.length - 1; k >= 0; k--) {
                     fbody = cwords[k] + ' ' + fbody;
                     if (strip(fbody).replace(/\s/g, '').indexOf(text) !== -1) {
                         index = k;
                         break;
                     }
                 }
             }
             return index;
         }

         function setcolortochangedword(changedwords, text, style) {
             var onlytxt = strip(changedwords.replace(/(&nbsp;|<([^>]+)>)/ig, '')).replace('class=\"kfSupportStartLabel\">', '');
             onlytxt = onlytxt.replace(/\/?[a-z][a-z0-9]*[^>]*>/ig, '');
             onlytxt = onlytxt.replace('<span', '').replace(/<\/?span[^>]*>/g, '');
             if (changedwords.indexOf('<br>') !== -1) {
                 onlytxt = changedwords.replace('<span', '').replace(/<\/?span[^>]*>/g, '');
             }
             onlytxt = strip(onlytxt.replace(/&nbsp;|(<([^>]+)>)|\/>|>/ig, ''));
             onlytxt = onlytxt.replace('—', '&mdash;').replace('–', '&ndash;');
             if (text.replace(/\s/g, '').replace('—', '&mdash;').indexOf(onlytxt.replace(/\s/g, '')) !== -1 && onlytxt !== '') {
                 console.log('onlytxt ' + onlytxt+"changedwords "+changedwords);
                 var str = "<span " + style + " >" + onlytxt + " " + "</span>";
                 changedwords = changedwords.replace(/\s\s|\s/g, '').replace(onlytxt, str);
             }
             return changedwords;
         }

         $scope.setPromisingColorData = function () {
             var colordata = '',
                 cid = '',
                 cobj = {};
             $scope.promisingColorData.length = 0;
             $scope.colors.forEach(function (promisingcolor, index) {
                 cid = 'none';
                 colordata = "";
                 $scope.promisingIdeacolorobjsarr.forEach(function (pcolorobj) {
                     if (pcolorobj.data.color === promisingcolor) {
                         colordata = pcolorobj.data.data;
                         cid = pcolorobj._id;
                         cobj = pcolorobj;
                     }
                 });
                 $scope.promisingColorData.push({
                     color: promisingcolor,
                     data: colordata,
                     id: cid,
                     obj: cobj
                 });
             });
         };

         $scope.clearColor = function () {
             $scope.targetColor = '';
             return $scope.targetColor;
         };

         $scope.getPromisingIdeacolorobjupdatemsg = function (promisingcolor) {
             $scope.updatemsg = getPromisingIdeacolorobjmsg(promisingcolor);
             return $scope.updatemsg;
         };

         var setPromisingIdeacolorobjcreatemsg = function (promisingcolor) {
             $scope.createmsg = getPromisingIdeacolorobjmsg(promisingcolor);
         };

         var getPromisingIdeacolorobjmsg = function (promisingcolor) {
             var msg = ' (Unassign)';
             $scope.promisingIdeacolorobjsarr.forEach(function (pcolorobj) {
                 if (pcolorobj.data.color === promisingcolor) {
                     msg = ' (' + pcolorobj.data.data + ')';
                     return msg;
                 }
             });
             return msg;
         };

         $scope.$watch('targetColor', function () {
             setPromisingIdeacolorobjcreatemsg($scope.targetColor);
         });

         $scope.savePromisingIdeacolorobj = function (pcolordata, pcolor, id, promingcolorobj) {
             if (id === 'none') {
                 $scope.promisingIdeacolorobj = {
                     color: pcolor,
                     data: pcolordata
                 };
                 $community.createPromisingcolorobj($scope.promisingIdeacolorobj, function () {});
             } else {
                 promingcolorobj.data = {
                     color: promingcolorobj.data.color,
                     data: pcolordata
                 };
                 $community.modifyObject(promingcolorobj, function () {
                     $community.refreshPromisingcolorobjs(function () {
                         $scope.promisingIdeacolorobjsarr = $community.getPromisingcolorobjsArray();
                     });
                 });
             }
         };

         /*********** svg-edit ************/
         $scope.svgInitialized = false;

         $scope.editSelected = function () {
         if ($scope.svgInitialized === false && $scope.contribution.type === 'Drawing') {
             var xhtml = '<iframe style="display: block;" id="svgedit" height="500px" width="100%" src="manual_components/svg-edit-2.8.1/svg-editor.html" onload="onSvgInitialized();"></iframe>';
             $('#svgeditdiv').html(xhtml);
             $scope.svgInitialized = true;
         }
         };
         });

function onSvgInitialized() {
    var wnd = document.getElementById('svgedit').contentWindow;
    var doc = wnd.document;
    var mainButton = doc.getElementById('main_button');
    mainButton.style.display = 'none';
    //var svg = '<svg width="100%" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1<\/title><rect stroke-width="5" stroke="#000000" fill="#FF0000" id="svg_1" height="35" width="51" y="35" x="32"/><ellipse ry="15" rx="24" stroke-width="5" stroke="#000000" fill="#0000ff" id="svg_2" cy="60" cx="66"/><\/g><\/svg>';
    var svg = '';
    if (window.contribution) {
        svg = window.contribution.data.svg;
    }
    wnd.svgCanvas.setSvgString(svg);
    wnd.svgEditor.showSaveWarning = false;
}
