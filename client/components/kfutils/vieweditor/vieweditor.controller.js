'use strict';

angular.module('kf6App')
    .controller('VieweditorCtrl', function($scope, $community/*, $http*/) {

        $scope.update = function() {
            $community.getContext($scope.contribution._id, function(context){
                $scope.rootContext = context;
            });
        };

        $scope.update();


    });