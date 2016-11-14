'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('promisingideas', {
        url: '/promisingideas/:communityId',
        templateUrl: 'app/promisingideas/promisingideas.html',
        controller: 'PromisingIdeasCtrl'
      });
  });
