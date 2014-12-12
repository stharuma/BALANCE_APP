'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('scaffold', {
        url: '/scaffold/:communityId',
        templateUrl: 'app/scaffold/scaffold.html',
        controller: 'ScaffoldCtrl'
      });
  });