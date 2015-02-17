'use strict';

angular.module('kf6App')
    .controller('AttachmentUploaderCtrl', function($scope, $http, $upload, $community) {
        $scope.onFileSelect = function($files) {
            $files.forEach(function(file) {
                $scope.createAttachment(file);
            });
        };

        $scope.createAttachment = function(file) {
            $community.createAttachment(function(attachment) {
                $scope.upload = $upload.upload({
                        url: 'api/upload',
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
                        attachment.tmpFilename = data.tmpFilename;
                        $community.modifyObject(attachment, function(newAttachment) {
                            $scope.notifyAttachmentUploaded(newAttachment);
                        });
                    }).error(function( /*data, status*/ ) {
                        window.alert('error on uploading');
                    });
            });
        };

        $scope.notifyAttachmentUploaded = function(attachment) {
            if (!$scope.attachmentUploaded) {
                window.alert('$scope.attachmentUploaded is not defined.');
                return;
            }
            $scope.attachmentUploaded(attachment);
        };
    });