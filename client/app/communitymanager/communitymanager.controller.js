'use strict';

angular.module('kf6App')
    .controller('CommunitymanagerCtrl', function($scope, $http, $state, Auth, $location, $community) {
        $scope.selected = {};
        $scope.myRegistrations = [];
        $scope.communities = [];
        $scope.newCommunity = {};
        $scope.isAdmin = Auth.isAdmin;

        $http.get('/api/users/myRegistrations').success(function(myRegs) {
            $scope.myRegistrations = myRegs;
        });

        $http.get('/api/communities').success(function(communities) {
            $scope.communities = communities;
        });

        $scope.addRegistration = function() {
            if (!$scope.selected.community) {
                window.alert('Community must be selected');
                return;
            }
            var author = {};
            author.userId = Auth.getCurrentUser()._id;
            author.communityId = $scope.selected.community._id;
            author.registrationKey = $scope.selected.key;
            $http.post('/api/authors', author).success(function() {
                $state.reload();
            }).error(function(msg) { //function(data, status, headers, config)
                window.alert('Error: ' + msg);
            });
        };

        $scope.addNewCommunity = function() {
            if (!$scope.newCommunity.title || $scope.newCommunity.title === '') {
                window.alert('Title must be input');
                return;
            }
            if (!$scope.newCommunity.key || $scope.newCommunity.key === '') {
                window.alert('RegistrationKey must be input');
                return;
            }
            $http.post('/api/communities', {
                title: $scope.newCommunity.title,
                registrationKey: $scope.newCommunity.key
            }).success(function(community) {
                $community.enter(community._id, function() {
                    $community.createView('Welcome', function() {
                        $community.createDefaultScaffold(function() {
                            $state.reload();
                        });
                    });
                });
            }).error(function() {
                console.error('error in creating community');
            });
            $scope.newCommunity = {};
        };

        $scope.enterCommunity = function(author) {
            //$community.login(author._id, function() {
            $location.path('communitytop/' + author.communityId);
            //});
        };

        $scope.toTimeString = function(time) {
            if (!time) {
                return '';
            }
            var d = new Date(time);
            return d.toLocaleString();
        };

        $scope.openManager = function() {
            if (!$scope.selected.community) {
                window.alert('Error: please select community.');
                return;
            }
            var id = $scope.selected.community._id;
            var url = 'communityeditor/' + id;
            $location.path(url);
        };

        $scope.$on('$destroy', function() {});
    });