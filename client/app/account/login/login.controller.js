'use strict';

angular.module('kf6App')
    .controller('LoginCtrl', function($scope, Auth, $location, $window, $kfutil) {
        $scope.user = {};
        $scope.errors = {};

        $scope.login = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                Auth.login({
                        userName: $scope.user.userName,
                        password: $scope.user.password
                    })
                    .then(function() {
                        // Logged in, redirect to home
                        $location.path('/');
                    })
                    .catch(function(err) {
                        $scope.errors.other = err.message;
                    });
            }
        };

        $scope.loginOauth = function(provider) {
            $window.location.href = '/auth/' + provider;
        };

        if ($kfutil.isIE()) {
            $scope.IEwarning = true;
            window.alert("Internet Explorer is not recommended for use of KF6.");
        }
    });
