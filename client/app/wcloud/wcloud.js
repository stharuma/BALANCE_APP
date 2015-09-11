'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('wcloud', {
        url: '/wcloud',
        templateUrl: 'app/wcloud/wcloud.html',
        controller: 'WcloudCtrl'
      });
  });