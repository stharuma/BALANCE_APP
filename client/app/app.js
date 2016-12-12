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
        'pascalprecht.translate',
        'colorpicker.module',
        'ngCookies',
        'chart.js',
        'ngCsv',
        'ngjsColorPicker',
        'xeditable'
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
          .useStaticFilesLoader({
            prefix: '../assets/translations/',
            suffix: '.json'
          })
          .registerAvailableLanguageKeys(['en', 'es', 'fr'])
          .determinePreferredLanguage() // position before fallbackLanguage() seems crucial
          //.preferredLanguage('fr')
          .fallbackLanguage('en')
          .useSanitizeValueStrategy('escape')
          .useCookieStorage();
    }])
  .controller('LanguageCtrl', function ($scope, $translate) {
    $scope.changeLanguage = function (key) {
      console.log('proposedLanguage', $translate.proposedLanguage());
      console.log('new language', key);
      $translate.use(key);
  };
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

.run(function($rootScope, $location, Auth, editableOptions) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
        Auth.isLoggedInAsync(function(loggedIn) {
            if (next.authenticate && !loggedIn) {
                $location.path('/login');
            }
        });
    });
    editableOptions.theme = 'bs3';
});
