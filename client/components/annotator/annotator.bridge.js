/*global Annotator*/
'use strict';

angular.module('kf6App').directive('annotatable', function() {
    return {
        restrict: 'A',
        link: function(scope /* , element, attrs */ ) {

            var contents = angular.element(element).annotator();

            Annotator.Plugin.KFPlugin = function(/*element*/) {
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
                        if(scope.annotatorHandler){
                            scope.annotatorHandler.annotatorInitialized(this.annotator);
                        }
                    }
                };
            };
            contents.annotator('addPlugin', 'KFPlugin');
            contents.annotator('addPlugin', 'Tags');
            contents.annotator('addPlugin', 'Permissions', {
                user: 'me',
                permissions: {
                    read: 'me'
                },
                showEditPermissionsCheckbox: false
            });
        }
    };
});