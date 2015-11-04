'use strict';

angular.module('kf6App')
    .controller('SignupCtrl', function($scope, Auth, $location, $window) {
        $scope.user = {};
        $scope.errors = {};

        $scope.register = function(form) {
            $scope.submitted = true;

            if (form.$valid) {
                Auth.createUser({
                        firstName: $scope.user.firstName,
                        lastName: $scope.user.lastName,
                        email: $scope.user.email,
                        username: $scope.user.username,
                        password: $scope.user.password,
                        registrationKey: $scope.user.registrationKey
                    })
                    .then(function() {
                        // Account created, redirect to home
                        $location.path('/');
                    })
                    .catch(function(err) {
                        err = err.data;
                        $scope.errors = {};

                        if (err.errorCode) {
                            $scope.errors = err;
                            form.registrationKey.$setValidity('mongoose', false);
                            return;
                        }

                        // Update validity of form fields that match the mongoose errors
                        angular.forEach(err.errors, function(error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.message;
                        });
                    });
            }
        };

        $scope.loginOauth = function(provider) {
            $window.location.href = '/auth/' + provider;
        };
    });