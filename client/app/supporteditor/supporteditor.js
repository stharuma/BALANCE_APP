'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('supporteditor', {
        url: '/supporteditor',
        templateUrl: 'app/supporteditor/supporteditor.html',
        controller: 'SupporteditorCtrl'
      });
  });