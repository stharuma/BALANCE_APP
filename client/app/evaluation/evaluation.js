'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('evaluation', {
        url: '/evaluation/:viewId',
        templateUrl: 'app/evaluation/evaluation.html',
        controller: 'EvaluationCtrl'
      });
  });