'use strict';

angular.module('kf6App')
    .factory('$ac', function($community) {
        var authorRequirementTable = {
            private: {
                r: true,
                w: true
            },
            protected: {
                r: false,
                w: true
            },
            public: {
                r: false,
                w: false
            }
        };

        var fullfillRequirement = function(object, author, requiredPermission) {
            if (!object || !author) {
                return false;
            }

            if (author.role === 'manager') {
                return true;
            }

            if (authorRequirementTable[object.permission][requiredPermission] === false) {
                return true;
            }

            //author requirement
            return isAuthor(object, author);
        };

        var isAuthor = function(object, author) {
            //This is not work because ObjectId object is different
            //return _.contains(object.authors, author._id.toString());
            return object.authors.indexOf(author._id) >= 0;
        };

        var isEditable = function(object) {
            return fullfillRequirement(object, $community.getCommunityData().author, 'w');
        };

        return {
            fullfillRequirement: fullfillRequirement,
            isAuthor: isAuthor,
            isEditable: isEditable,
            mixIn: function(scope, object) {
                scope.isEditable = function() {
                    return isEditable(object);
                };
            }
        };
    });