'use strict';

/*
 *  kfac.js: KF AccessControl Program
 *  This program provides an accesscontrol model and its algorithm to check it
 *  This program should be shared in server and client side.
 *    (Now I am copying to both side and sharing manually. Bower and npm should be used in the future)
 *
 *  Copyright(c) 2015 Yoshiaki Matsuzawa All Rights Reserved.
 */
var kfac = function() {
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

    return {
        fullfillRequirement: fullfillRequirement,
        isAuthor: isAuthor
    };
};

/* for supporting both client and server side */
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = kfac;
    }
    exports.kfac = kfac;
} 
// else {
//     root['kfac'] = kfac;
// }