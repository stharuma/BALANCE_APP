/*global Annotator*/
'use strict';

angular.module('kf6App').directive('annotatable', function($community) {
    return {
        restrict: 'A',
        link: function(scope, element /*, attrs */ ) {

            var contents = angular.element(element).annotator();

            Annotator.Plugin.KFPlugin = function( /*element*/ ) {
                return {
                    pluginInit: function() {
                        this.annotator
                            .subscribe('annotationCreated', function(annotation) {
                                if (scope.annotatorHandler) {
                                    scope.annotatorHandler.annotationCreated(annotation);
                                }
                            })
                            .subscribe('annotationUpdated', function(annotation) {
                                if (scope.annotatorHandler) {
                                    scope.annotatorHandler.annotationUpdated(annotation);
                                }
                            })
                            .subscribe('annotationDeleted', function(annotation) {
                                if (scope.annotatorHandler) {
                                    scope.annotatorHandler.annotationDeleted(annotation);
                                }
                            });
                        if (scope.annotatorHandler) {
                            scope.annotatorHandler.annotatorInitialized(this.annotator);
                        }
                    }
                };
            };
            contents.annotator('addPlugin', 'KFPlugin');
            contents.annotator('addPlugin', 'Tags');
            $community.refreshAuthor(function(author) {
                var uname = author.userName;
                if (!uname) {
                    uname = '*undefined user*';
                }
                contents.annotator('addPlugin', 'Permissions', {
                    user: uname,
                    permissions: {
                        read: [uname],
                        update: [uname],
                        delete: [uname],
                        admin: [uname]
                    },
                    showEditPermissionsCheckbox: false
                });
            });
        }
    };
});