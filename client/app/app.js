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
            'FULLNAME': 'Name',
            'LOGIN': 'Login',
            'PASSWORD': 'Password',
            'REGISTER': 'Register',
            'REGISTER_ERROR_FULLNAME': 'A name is required',
            'REGISTER_ERROR_EMAIL_INVALID': 'Doesn\'t look like a valid email.',
            'REGISTER_ERROR_EMAIL_MISSING': 'What\'s your email address?',
            'REGISTER_ERROR_PASSWORD': 'Password must be at least 3 characters.'
        });

        $translateProvider.translations('fr', {
            'Hello': 'Bonjour',
            'Admin': 'Administration',
            'COMMUNITIES': 'Communautés',
            'COMMUNITY': 'Communauté',
            'COMMUNITY_JOIN': 'Joindre une communauté',
            'EMAIL': 'Courriel',
            'FULLNAME': 'Nom complet',
            'LOGIN': 'Connexion',
            'PASSWORD': 'Mot de passe',
            'REGISTER': 'Inscription',
            'REGISTER_ERROR_FULLNAME': 'Veuillez saisir un nom complet.',
            'REGISTER_ERROR_EMAIL_INVALID': 'Veuillez saisie une adresse de courriel valide.',
            'REGISTER_ERROR_EMAIL_MISSING': 'Veuillez sairsir une adresse de courriel.',
            'REGISTER_ERROR_PASSWORD': 'Le mot de passe doit comporter au moins 3 caractères.'
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
