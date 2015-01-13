'use strict';

angular.module('kf6App')
    .controller('CommunitytopCtrl', function($scope, $community, $stateParams, $location) {
        var communityId = $stateParams.communityId;

        $community.enter(communityId);

        $scope.handler = function() {
            var views = $community.getViews();
            if (views.length <= 0) {
                window.alert('view not found.');
                return;
            }
            //var url = './view/' + views[0]._id;
            //window.location = url;
            var url = '/view/' + views[0]._id;            
            $location.path(url).replace();
        };

        $community.refreshViews($scope.handler);
    });