'use strict';

angular.module('kf6App')
    .controller('AttachmentCtrl', function($scope, $upload) {
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
                        //$scope.attachments.push('/uploads/' + filename);
                    }).error(function(data, status) {
                        console.log(data, status);
                    });
            });
        };
    });