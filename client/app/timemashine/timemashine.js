'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('timemashine', {
        url: '/timemashine/:viewId',
        templateUrl: 'app/timemashine/timemashine.html',
        controller: 'TimemashineCtrl'
      });
  });
