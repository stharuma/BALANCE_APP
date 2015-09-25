angular.module('kf6App').directive('annotatable', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var contents = angular.element(element).annotator();

            Annotator.Plugin.KFPlugin = function(element) {
                return {
                    pluginInit: function() {
                        this.annotator
                            .subscribe("annotationCreated", function(annotation) {
                                console.info("The annotation: %o has just been created!", annotation)
                            })
                            .subscribe("annotationUpdated", function(annotation) {
                                console.info("The annotation: %o has just been updated!", annotation)
                            })
                            .subscribe("annotationDeleted", function(annotation) {
                                console.info("The annotation: %o has just been deleted!", annotation)
                            });
                    }
                }
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