'use strict';

angular.module('kf6App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('attachment', {
        url: '/attachment',
        templateUrl: 'app/attachment/attachment.html',
        controller: 'AttachmentCtrl'
      });
  });