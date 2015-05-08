'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('search', {
        url: '/search/:communityId',
        templateUrl: 'app/search/search.html',
        controller: 'SearchCtrl'
      });
  });