'use strict';

angular.module('kf6App', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'btford.socket-io',
        'ui.router',
        'ui.bootstrap',
        'ui.tinymce',
        'ui.sortable',
        'angularFileUpload',
        'ng-context-menu',
        'ui.select',
        'pascalprecht.translate'
    ])
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $urlRouterProvider.otherwise('/');

        /* handling url */
        $urlRouterProvider.when('/uploads/:xxx', function($urlRouter, $state, $location) {
            window.location = $location.url();
            return true;
        });

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
    })
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('en', {
            'Hello': 'Hello',
            'Admin': 'Admin',
            'COMMUNITIES': 'Communities',
            'COMMUNITY': 'Community',
            'COMMUNITY_JOIN': 'Join Community',
            'EMAIL': 'Email',
            'LOGIN': 'Login',
            'PASSWORD': 'Password',
            'REGISTER': 'Register'
        });

        $translateProvider.translations('fr', {
            'Hello': 'Bonjour',
            'Admin': 'Administration',
            'COMMUNITIES': 'Communautés',
            'COMMUNITY': 'Communauté',
            'COMMUNITY_JOIN': 'Joindre une communauté',
            'EMAIL': 'Courriel',
            'LOGIN': 'Connexion',
            'PASSWORD': 'Mot de passe',
            'REGISTER': 'Inscription'
        });

        $translateProvider.preferredLanguage('fr');
    }])

.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
    return {
        // Add authorization token to headers
        request: function(config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('token')) {
                config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function(response) {
            if (response.status === 401) {
                $location.path('/login');
                // remove any stale tokens
                $cookieStore.remove('token');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
})

.run(function($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
        Auth.isLoggedInAsync(function(loggedIn) {
            if (next.authenticate && !loggedIn) {
                $location.path('/login');
            }
        });
    });
});
