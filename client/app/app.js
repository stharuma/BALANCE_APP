'use strict';

var translationsEN = {
    'home': 'Home',
    'admin': 'Admin',
    'communities': 'Communities',
    'community': 'Community',
    'community_join': 'Join Community',
    'community_possible': 'possible communitie(s)',
    'community_registration_key': 'Community Registration Key',
    'community_select': 'Select community',
    'firstName': 'First Name',
    'join': 'Join',
    'email': 'Email',
    'lastName': 'Last Name',
    'login': 'Login',
    'login_error_nameAndPass' : 'Please enter your email and password.',
    'login_error_email' : 'Please enter a valid email.',
    'password': 'Password',
    'register': 'Register',
    'registration_key': 'Registration key',
    'registration_key_invalid': 'Invalid registration key.',
    'register_error_firstName' : 'A first name is required.',
    'register_error_lastName': 'A last name is required.',
    'register_error_email_invalid': 'Doesn\'t look like a valid email.',
    'register_error_email_missing': 'What\'s your email address?',
    'register_error_password': 'Password must be at least 4 characters.',
    'logout': 'Logout',
    'community_enter': 'Accéder à la commmunauté'
};

var translationsFR = {
    'home': 'Accueil',
    'admin': 'Administration',
    'communities': 'Communautés',
    'community': 'Communauté',
    'community_join': 'Joindre une communauté',
    'community_possible': 'communauté(s) possible(s)',
    'community_registration_key': 'Code d\'adhésion',
    'community_select': 'Sélectionnez une communauté',
    'firstName': 'Prénom',
    'join': 'Joindre',
    'email': 'Courriel',
    'lastName': 'Nom',
    'login': 'Connexion',
    'login_error_nameAndPass' : 'Veuillez saisir votre courriel et mot de passe.',
    'login_error_email' : 'Veuillez saisir une adresse de courriel valide.',
    'password': 'Mot de passe',
    'register': 'Inscription',
    'registration_key': 'Code d\'inscription',
    'registration_key_invalid': 'Code d\'inscription invalide.',
    'register_error_firstName' : 'Veuillez saisir un prénom.',
    'register_error_lastName': 'Veuillez saisir un nom.',
    'register_error_email_invalid': 'Veuillez saisir une adresse de courriel valide.',
    'register_error_email_missing': 'Veuillez saisir une adresse de courriel.',
    'register_error_password': 'Le mot de passe doit comporter au moins 4 caractères.',
    'logout': 'Déconnexion',
    'community_enter': 'Accéder à la commmunauté'
};

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
        $translateProvider
            .translations('en', translationsEN)
            .translations('fr', translationsFR)
            .fallbackLanguage('en')
          //.registerAvailableLanguageKeys(['en','fr'])
          //.determinePreferredLanguage();
            .preferredLanguage('fr');
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
