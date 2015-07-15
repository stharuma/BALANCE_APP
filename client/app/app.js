'use strict';

//var translationsEN = require('resources/i18n/en.json');
//var translationsFR = require('resources/i18n/fr.json');
var translationsEN = {
  "add": "Add",
  "authors": "Authors",
  "home": "Home",
  "admin": "Admin",
  "attachments": "Attachments",
  "build-on": "Build-on",
  "communities": "Communities",
  "community": "Community",
  "community_enter": "Accéder à la commmunauté",
  "community_join": "Join Community",
  "community_possible": "possible communitie(s)",
  "community_registration_key": "Community Registration Key",
  "community_select": "Select community",
  "connections": "Connections",
  "contribute": "Contribute",
  "createdBy": "Created by",
  "edit": "Edit",
  "firstName": "First Name",
  "history": "History",
  "join": "Join",
  "keyword-s": "Keyword(s)",
  "email": "Email",
  "lastName": "Last Name",
  "lastModified": "Last modified",
  "login": "Login",
  "login_error_nameAndPass" : "Please enter your email and password.",
  "login_error_email" : "Please enter a valid email.",
  "manage" : "Manage",
  "password": "Password",
  "properties": "Properties",
  "read": "Read",
  "register": "Register",
  "registration_key": "Registration key",
  "registration_key_invalid": "Invalid registration key.",
  "register_error_firstName" : "A first name is required.",
  "register_error_lastName": "A last name is required.",
  "register_error_email_invalid": "Doesn't look like a valid email.",
  "register_error_email_missing": "What's your email address?",
  "register_error_password": "Password must be at least 4 characters.",
  "scaffolds": "Scaffolds",
  "logout": "Logout",
  "tools": "Tools",

};

var translationsFR = {
  "add": "Ajouter",
  "authors": "Auteurs",
  "attachments": "Pièce(s) jointe(s)",
  "home": "Accueil",
  "admin": "Administration",
  "build-on": "Élaborer",
  "communities": "Communautés",
  "community": "Communauté",
  "community_enter": "Accéder à la commmunauté",
  "community_join": "Joindre une communauté",
  "community_possible": "communauté(s) possible(s)",
  "community_registration_key": "Code d'adhésion",
  "community_select": "Sélectionnez une communauté",
  "connections": "Liens",
  "contribute": "Contribuer",
  "createdBy": "Créé(e) par",
  "edit": "Éditer",
  "firstName": "Prénom",
  "history": "Historique",
  "join": "Joindre",
  "keyword-s": "Mot(s)-clé(s)",
  "email": "Courriel",
  "lastName": "Nom",
  "lastModified": "Dernière modification",
  "login": "Connexion",
  "login_error_nameAndPass" : "Veuillez saisir votre courriel et mot de passe.",
  "login_error_email" : "Veuillez saisir une adresse de courriel valide.",
  "manage" : "Gérer",
  "password": "Mot de passe",
  "properties": "Propriétés",
  "read": "Lire",
  "register": "Inscription",
  "registration_key": "Code d'inscription",
  "registration_key_invalid": "Code d'inscription invalide.",
  "register_error_firstName" : "Veuillez saisir un prénom.",
  "register_error_lastName": "Veuillez saisir un nom.",
  "register_error_email_invalid": "Veuillez saisir une adresse de courriel valide.",
  "register_error_email_missing": "Veuillez saisir une adresse de courriel.",
  "register_error_password": "Le mot de passe doit comporter au moins 4 caractères.",
  "scaffolds": "Échafaudages",
  "logout": "Déconnexion",
  "tools": "Outils",
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
  /*
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider
          //.useStaticFilesLoader({
          //  prefix: 'resources/i18n/',
          //  suffix: '.json'
          //})
          .translations('en', translationsEN)
          .translations('fr', translationsFR)
            .fallbackLanguage('en')
          //.registerAvailableLanguageKeys(['en','fr'])
          //.determinePreferredLanguage();
            .preferredLanguage('fr');
    }])*/
  .config(function ($translateProvider) {

    $translateProvider

      /*
      .useStaticFilesLoader({
        prefix: 'locale-',
        suffix: '.json'
        })
      */
      .translations('en', translationsEN)
      .translations('fr', translationsFR)
      .preferredLanguage('fr')
      .fallbackLanguage('en');

  })

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
