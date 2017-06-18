'use strict';

angular.module('balanceApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('communitymanager', {
        url: 'y',
        templateUrl: 'app/communitymanager/communitymanager.html',
        controller: 'CommunitymanagerCtrl'
      });
  });