'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('contribution', {
        url: '/contribution/:contributionId',
        templateUrl: 'app/contribution/contribution.html',
        controller: 'ContributionCtrl'
      });
  });