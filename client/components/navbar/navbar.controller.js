'use strict';

angular.module('kf6App')
    .controller('NavbarCtrl', function($scope, $location, Auth, $translate) {
        $scope.menu = [{
            'title': 'Home',
            'link': '/'
        }];

        $scope.selectedLanguage = 'en';
        $scope.languages = ['en', 'fr'];

        $scope.languageSelected = function() {
            $translate.use($scope.selectedLanguage);
        };

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
    });