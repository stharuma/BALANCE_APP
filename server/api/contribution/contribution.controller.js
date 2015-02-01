'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');

var Contribution = require('./contribution.model');
var Record = require('../record/record.model');

// Get list of contributions
exports.index = function(req, res) {
    // Contribution.find(function(err, contributions) {
    //     if (err) {
    //         return handleError(res, err);
    //     }
    //     return res.json(200, contributions);
    // });
    return res.json(200, []);
};

// Get a single contribution
exports.show = function(req, res) {
    Contribution.findById(req.params.id, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        if (!contribution) {
            return res.send(404);
        }
        return res.json(contribution);
    });
};

// Creates a new contribution in the DB.
exports.create = function(req, res) {
    Contribution.create(req.body, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, contribution);
    });
};

var fs = require('fs');
var path = require('path');
var config = require('../../config/environment');

// Updates an existing contribution in the DB.
exports.update = function(req, res) {
    var newobj = req.body;

    if (newobj.type === 'Attachment') {
        try {
            var tmpFile = path.join(config.attachmentsPath, newobj.data.tmpFilename);
            if (fs.existsSync(tmpFile) === false) {
                return res.send(404);
            }

            // this part use recursive mkdir future
            var commDir = path.join(config.attachmentsPath, newobj.communityId);
            if (fs.existsSync(commDir) === false) {
                fs.mkdirSync(commDir);
            }
            var contribDir = path.join(commDir, newobj._id);
            if (fs.existsSync(contribDir) === false) {
                fs.mkdirSync(contribDir);
            }
            var versionDir = path.join(contribDir, newobj.data.version.toString());
            if (fs.existsSync(versionDir) === false) {
                fs.mkdirSync(versionDir);
            }
            var newFile = path.join(versionDir, newobj.data.filename);
            fs.renameSync(tmpFile, newFile);

            delete newobj.data.tmpFilename;
            newobj.data.url = path.join(config.attachmentsURL, newobj.communityId, newobj._id, newobj.data.version.toString(), newobj.data.filename);
        } catch (e) {
            return res.send(500);
        }
    }

    if (newobj._id) {
        delete newobj._id;
        delete newobj.__v; /* by using this, we can avoid conflict of editing multi users*/
    }

    Contribution.findById(req.params.id, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        if (!contribution) {
            return res.send(404);
        }
        var updated = _.merge(contribution, newobj);
        if (newobj.authors) {
            updated.authors = newobj.authors;
            updated.markModified('authors');
        }
        if (newobj.keywords) {
            updated.keywords = newobj.keywords;
            updated.markModified('keywords');
        }
        if (newobj.data) {
            updated.markModified('data');
        }
        updated.save(function(err, newContribution) {
            if (err) {
                console.log(err);
                return handleError(res, err);
            }
            Record.create({
                authorId: req.user._id,
                targetId: contribution._id,
                type: 'update'
            });
            return res.json(200, newContribution);
        });
    });
};



// Deletes a contribution from the DB.
exports.destroy = function(req, res) {
    Contribution.findById(req.params.id, function(err, contribution) {
        if (err) {
            return handleError(res, err);
        }
        if (!contribution) {
            return res.send(404);
        }
        contribution.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

exports.showrecords = function(req, res) {
    Record.find({
        targetId: req.params.id
    }, function(err, records) {
        if (err) {
            return handleError(res, err);
        }
        if (!records) {
            return res.send(404);
        }
        return res.json(records);
    });
};

exports.search = function(req, res) {
    var query = req.body.query;
    var communityId = query.communityId;
    if (!communityId) {
        return res.json(400, {
            'err': 'communityId is necessary'
        });
    }

    var mongoQuery = {
        $and: []
    };

    mongoQuery.$and.push({
        communityId: communityId
    });

    if (query.authors.length > 0) {
        var authorIds = [];
        query.authors.forEach(function(authorIdStr) {
            authorIds.push(mongoose.Types.ObjectId(authorIdStr));
        });
        mongoQuery.$and.push({
            authors: {
                $in: authorIds
            }
        });
    }

    if (query.from !== undefined) {
        var dateFrom = new Date(query.from);
        mongoQuery.$and.push({
            created: {
                $gte: dateFrom
            }
        });
    }

    if (query.to !== undefined) {
        var dateTo = new Date(query.to);
        mongoQuery.$and.push({
            created: {
                $lte: dateTo
            }
        });
    }

    //http://stackoverflow.com/questions/10913568/mongoose-how-to-find-3-words-in-any-order-and-in-any-place-in-the-string-sql
    //(?=.*comp)(?=.*abc)(?=.*300).*
    var regexpstr = '';
    query.words.forEach(function(word) {
        regexpstr += '(?=.*' + word + ')';
    });
    regexpstr += '.*';
    mongoQuery.$and.push({
        text4search: new RegExp(regexpstr, 'i')
    });

    Contribution.find(mongoQuery).
    limit(50).
    exec(function(err, contributions) {
        if (err) {
            console.log(err);
            return handleError(res, err);
        }
        return res.json(200, contributions);
    });
};

// not used yet
// exports.textindexSearch = function(req, res) {
//     var text = req.body.searchText;
//     Contribution.find({
//             $text: {
//                 $search: text
//             }
//         }
//         // , {
//         //         score: {
//         //             $meta: 'textScore'
//         //         },
//         //         title: 1,
//         //         body: 1,
//         //         type: 1
//         //     }).
//         //     sort({
//         //         score: {
//         //             $meta: 'textScore'
//         //         }
//         //     }
//     ).
//     limit(10).
//     exec(function(err, posts) {
//         if (err) {
//             console.log(err);
//             return handleError(res, err);
//         }
//         return res.json(200, posts);
//     });
// };

exports.upload = function(req, res) {
    var file = req.files.file;
    var obj = {};
    obj.filename = file.originalFilename;
    obj.tmpFilename = file.path.split('\\').pop().split('/').pop();
    obj.size = file.size;
    obj.type = file.type;
    return res.json(200, obj);
};

function handleError(res, err) {
    console.log(err);
    return res.send(500, err);
}