'use strict';

angular.module('kf6App')
    .controller('ViewAuthorDateSelectorCtrl', function ($scope) {
        $scope.queryString = '';
        $scope.selectedItems = [];
        $scope.viewSelected = function (each) {
            $scope.selectedItems.push({
                viewTitle: each.title
            });
            $scope.queryString += ' -view:' + each._id;
            $scope.setSelectedData($scope.queryString, $scope.selectedItems);
        };

        $scope.authorSelected = function (author) {
            $scope.selectedItems.push({
                author: author.userName
            });
            $scope.queryString += ' -author:' + author.userName;
            $scope.setSelectedData($scope.queryString, $scope.selectedItems);
        };

        $scope.dateSelectedTo = function (to) {
            $scope.selectedItems.push({
                toDate: to.toISOString()
            });
            $scope.queryString += ' -to:' + to.toISOString();
            $scope.setSelectedData($scope.queryString, $scope.selectedItems);
        };

        $scope.dateSelectedFrom = function (from) {
            $scope.selectedItems.push({
                fromDate: from.toISOString()
            });
            $scope.queryString += ' -from:' + from.toISOString();
            $scope.setSelectedData($scope.queryString, $scope.selectedItems);
        };

        $scope.clearSelectedItems = function () {
            $scope.selectedItems.length = 0;
            $scope.queryString = '';
            $scope.setSelectedData($scope.queryString, $scope.selectedItems);
        };


    });