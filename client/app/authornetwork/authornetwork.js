'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('AuthorNetwork', {
        url: '/authornetwork/:viewId',
        templateUrl: 'app/authornetwork/AuthorNetwork.html',
        controller: 'AuthorNetworkCtrl'
      });
  });