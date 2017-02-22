'use strict';

angular.module('kf6App')
    .config(function($stateProvider) {
        $stateProvider
            .state('contribution2', {
                url: '/contribution/:contributionId/:contextId',
                templateUrl: 'app/contribution/contribution.html',
                controller: 'ContributionCtrl'
            });
        $stateProvider
            .state('contribution', {
                url: '/contribution/:contributionId',
                templateUrl: 'app/contribution/contribution.html',
                controller: 'ContributionCtrl'
            });
    });

angular.module('kf6App')
    .directive('kfDragSource', function() {
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
    
angular.module('kf6App')
    .directive('kfimgdrag', function() {
        return {
            restrict: 'A',
            link: function(scope, element) {
                var $scope = scope.$parent;
                var el = element[0];
                //el.draggable = true;
                el.addEventListener('dragstart', $scope.imgDragStart);
            }
        };
    });