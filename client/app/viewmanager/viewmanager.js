'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('viewmanager', {
        url: '/viewmanager',
        templateUrl: 'app/viewmanager/viewmanager.html',
        controller: 'ViewmanagerCtrl'
      });
  });