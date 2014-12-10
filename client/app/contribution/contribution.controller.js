'use strict';

angular.module('kf6App')
    .controller('ContributionCtrl', function($scope, $http, $member, $stateParams) {
        var contributionId = $stateParams.contributionId;

        $scope.contribution = {};
        $scope.authors = [];
        $scope.records = [];
        $scope.communityMembers = [];

        $http.get('/api/contributions/' + contributionId).success(function(contribution) {
            $scope.contribution = contribution;
            $scope.contribution.authors.forEach(function(authorId) {
                $scope.authors.push($member.getMember(authorId));
            });
            window.setTimeout(function() {
                $http.post('/api/records/read/' + contributionId);
            }, 3000);
            $scope.updateRecords();
            $scope.communityMembers = $member.getMembers();
            $member.updateCommunityMembers();
        }).error(function() {});

        $scope.updateRecords = function() {
            $http.get('/api/contributions/records/' + contributionId).success(function(records) {
                $scope.records = records;
                $scope.records.forEach(function(record) {
                    record.user = $member.getMember(record.authorId);
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
            $scope.contribution.authors = _.pluck($scope.authors, '_id');
            $http.put('/api/contributions/' + contributionId, $scope.contribution).success(function() {}).error(function() {});
        };

        $scope.buildson = function() {
            $http.post('/api/notes', {
                title: 'New Note',
                body: ''
            }).success(function(note) {
                $http.post('/api/links', {
                    from: note._id,
                    to: $scope.contribution._id,
                    type: 'buildson'
                });
            });
        };

        $scope.tinymceOptions = {
            theme: 'modern',
            menubar: false,
            statusbar: false,
            plugins: ['advlist autolink autosave link image lists charmap print preview hr anchor pagebreak spellchecker searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking table directionality emoticons template textcolor paste textcolor noneditable fullpage'],
            toolbar: "undo redo formatselect fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | forecolor backcolor bullist numlist link image code",
            //toolbar1: 'undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
            //toolbar2: 'forecolor backcolor | emotions link unlink image media | code | styleselect fontselect fontsizeselect',
            forced_root_block: false,
            force_br_newlines: true,
            force_p_newlines: false,
            extended_valid_elements: 'kf-*[*]',
            custom_elements: '~kf-[a-zA-Z0-9]+$',
            toolbar_items_size: 'small',
            content_css: '/app/kf.css,/app/kfmce.css',
            inline_styles: true
        };

        // window.onresize = function() {
            
        // };
    });