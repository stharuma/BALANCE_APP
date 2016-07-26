'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('basicstats', {
        url: '/basicstats/:viewId',
        templateUrl: 'app/basicstats/basicstats.html',
        controller: 'BasicStatsCtrl'
      });
  });