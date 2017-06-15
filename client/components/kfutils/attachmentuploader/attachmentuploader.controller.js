'use strict';

angular.module('kf6App')
    .controller('AttachmentUploaderCtrl', function($scope, $http, $upload, $community) {
        $scope.onFileSelect = function($files, x, y) {
            $files.forEach(function(file) {
                //$scope.createAttachment(file);
                if(file.type.indexOf("image/") >= 0){
                    var _URL = window.URL || window.webkitURL;
                    var img = document.createElement("img");
                    img.onload = function() {
                        var width  = img.naturalWidth  || img.width;
                        var height = img.naturalHeight || img.height;
                        file.width = width;
                        file.height = height;
                        $scope.createAttachment(file, x, y); 
                    };
                    img.src = _URL.createObjectURL(file);
                }
                else{
                    $scope.createAttachment(file, x, y);
                }
            });
        };

        $scope.status.onFileSelect = $scope.onFileSelect;

        $scope.createAttachment = function(file, x, y) {
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
                            newAttachment.data.width = file.width;
                            newAttachment.data.height = file.height;
                            $scope.notifyAttachmentUploaded(newAttachment, x, y);
                        });
                    }).error(function( /*data, status*/ ) {
                        window.alert('error on uploading');
                    });
            });
        };

        $scope.notifyAttachmentUploaded = function(attachment, x, y) {
            if (!$scope.attachmentUploaded) {
                window.alert('$scope.attachmentUploaded is not defined.');
                return;
            }
            $scope.attachmentUploaded(attachment, x, y);
        };
    });