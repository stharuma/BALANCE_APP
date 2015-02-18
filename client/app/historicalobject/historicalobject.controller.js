'use strict';

angular.module('kf6App')
    .controller('HistoricalobjectCtrl', function($scope, $http, $stateParams) {
        $scope.historicalId = $stateParams.id;
        $http.get('api/historicalobjects/' + $scope.historicalId)
            .success(function(historical) {
                $scope.historical = historical;
            });
    });