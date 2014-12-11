'use strict';

angular.module('kf6App')
    .controller('AttachmentCtrl', function($scope, $http, $upload, Auth) {
        $scope.updated = function(attachment) {
            console.log('updated to:' + attachment.url);
            console.log('please set updated handler');
        };

        if ($scope.$parent.updated) {
            $scope.updated = $scope.$parent.updated;
        }

        $scope.createContribution = function(url, file) {
            var authors = [Auth.getCurrentUser()._id];
            $http.post('/api/attachments', {
                title: 'Attachment',
                url: url,
                originalName: file.name,
                mime: file.type,
                size: file.size,
                authors: authors
            }).success(function(attachment) {
                $scope.updated(attachment);
            });
        };

        $scope.onFileSelect = function($files) {
            $files.forEach(function(file) {
                $scope.upload = $upload.upload({
                        url: 'api/contributions/upload',
                        method: 'POST',
                        data: {
                            myObj: $scope.myModelObj
                        },
                        file: file
                    })
                    .progress(function(evt) {
                        var percent = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.progress = percent;
                    }).success(function(data) {
                        var path = data.file.path;
                        var filename = path.split('\\').pop().split('/').pop();
                        var url = '/uploads/' + filename;
                        $scope.createContribution(url, file);
                    }).error(function(data, status) {
                        console.log(data, status);
                    });
            });
        };
    });