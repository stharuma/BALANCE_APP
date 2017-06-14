'use strict';

angular.module('kf6App')
    .config(function ($stateProvider) {
        $stateProvider
            .state('ideagrowth', {
                url: '/ideagrowth/:communityId',
                templateUrl: 'app/ideagrowth/ideagrowth.html',
                controller: 'IdeaGrowthCtrl'
            });
    });