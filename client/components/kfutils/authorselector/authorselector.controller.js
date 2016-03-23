'use strict';

angular.module('kf6App')
    .controller('AuthorSelectorCtrl', function($scope, $community) {

        $scope.selected = {};

        $scope.initializingHooks.push(function() {
            $scope.community = $community.getCommunityData();
            $scope.authors = $scope.community.membersArray;
        });

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

