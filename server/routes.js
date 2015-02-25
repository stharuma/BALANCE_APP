/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

    // Insert routes below
    app.use('/api/groups', require('./api/KGroup'));
    app.use('/api/historicalobjects/', require('./api/KHistoricalObject'));
    app.use('/api/communities', require('./api/KCommunity'));
    app.use('/api/objects', require('./api/KObject'));
    app.use('/api/contributions', require('./api/KContribution'));
    app.use('/api/authors', require('./api/KAuthor'));
    app.use('/api/links', require('./api/KLink'));
    app.use('/api/records', require('./api/KRecord'));
    app.use('/api/upload', require('./api/upload'));
    app.use('/api/users', require('./api/user'));

    app.use('/auth', require('./auth'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function(req, res) {
            res.sendfile(app.get('appPath') + '/index.html');
        });
};