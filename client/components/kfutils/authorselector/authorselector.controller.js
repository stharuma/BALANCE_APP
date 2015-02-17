'use strict';

angular.module('kf6App')
    .controller('AuthorSelectorCtrl', function($scope, $community) {
        $scope.community = $community.getCommunityData();
        $scope.authors = $scope.community.membersArray;
        $scope.selected = {};

        $scope.addAuthor = function() {
            if (!$scope.selected.author) {
                window.alert('no author selected.');
                return;
            }

            if (!$scope.authorSelected) {
                window.alert('no $scope.authorSelected defined.');
                return;
            }

            $scope.authorSelected($scope.selected.author);
        };
    });