'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('view', {
        url: '/view/:viewId',
        templateUrl: 'app/view/view.html',
        controller: 'ViewCtrl'
      });
  });