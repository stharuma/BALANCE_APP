'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('scaffoldeditor', {
        url: '/scaffoldeditor',
        templateUrl: 'app/scaffoldeditor/scaffoldeditor.html',
        controller: 'ScaffoldeditorCtrl'
      });
  });