'use strict';

angular.module('kf6App')
    .controller('AttachmentCtrl', function($scope, $http, $upload, $community) {
        $scope.updated = function(attachment) {
            console.log('updated to:' + attachment.url);
            console.log('please set updated handler');
        };

        if ($scope.$parent.attachmentUpdated) {
            $scope.updated = $scope.$parent.attachmentUpdated;
        }

        $scope.onFileSelect = function($files) {
            $files.forEach(function(file) {
                $scope.createAttachment(file);
            });
        };

        $scope.createAttachment = function(file) {
            $community.createAttachment(function(attachment) {
                $scope.upload = $upload.upload({
                        url: 'api/contributions/upload',
                        method: 'POST',
                        file: file
                    })
                    .progress(function(evt) {
                        var percent = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = percent;
                    }).success(function(data) {
                        attachment.title = data.filename;
                        attachment.status = 'active';
                        data.version = attachment.data.version + 1;
                        attachment.data = data;
                        $http.put('api/contributions/' + attachment._id, attachment).success(function(newAttachment) {
                            $scope.updated(newAttachment);
                        });
                    }).error(function( /*data, status*/ ) {
                        window.alert('error on uploading');
                    });
            });
        };
    });