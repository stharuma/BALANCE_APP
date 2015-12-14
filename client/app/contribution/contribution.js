'use strict';

angular.module('kf6App')
    .config(function($stateProvider) {
        $stateProvider
            .state('contribution', {
                url: '/contribution/:contributionId',
                templateUrl: 'app/contribution/contribution.html',
                controller: 'ContributionCtrl'
            });
    });

angular.module('kf6App')
    .directive('kfDragSource', function($kftag, $kfutil) {
        return {
            restrict: 'C',
            link: function(scope, element) {
                var $scope = scope.$parent;
                var el = element[0];
                //el.draggable = true;
                el.addEventListener('dragstart', $scope.kfdragstart);
                el.addEventListener('copy', $scope.kfcopy);
            }
        };
    });