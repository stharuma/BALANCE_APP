'use strict';

angular.module('kf6App')
        .controller('NavbarCtrl', function($scope, $location, Auth, $http, $modal) {
          $scope.menu = [{
              'title': 'home',
              'link': '/'
            }];
        $scope.isCollapsed = true;
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.isAdmin = Auth.isAdmin;
        $scope.getCurrentUser = Auth.getCurrentUser;

        $scope.logout = function() {
            Auth.logout();
            $location.path('/login');
        };

        $scope.isActive = function(route) {
            return route === $location.path();
        };

        $scope.openDialog = function(size) {
            $modal.open({
                animation: true,
                templateUrl: 'VersionModalContent.html',
                controller: 'VersionModalCtrl',
                size: size
            });
        };

    });

angular.module('kf6App')
    .controller('VersionModalCtrl', function($scope, $http, $kfutil) {
        $kfutil.mixIn($scope);
        $scope.loadVersion = function() {
            if (!$scope.version) {
                $http.get('api/version').success(function(res) {
                    $scope.version = res;
                });
            }
        };
        $scope.loadVersion();
    });
