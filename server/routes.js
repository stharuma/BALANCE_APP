/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

    // Insert routes below
    app.use('/api/objects', require('./api/KObject'));
    app.use('/api/registrations', require('./api/registration'));
    app.use('/api/communities', require('./api/community'));
    app.use('/api/links', require('./api/link'));
    app.use('/api/records', require('./api/record'));
    app.use('/api/contributions', require('./api/contribution'));
    app.use('/api/users', require('./api/user'));

    app.use('/auth', require('./auth'));
    app.use('/commauth', require('./commauth'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function(req, res) {
            res.sendfile(app.get('appPath') + '/index.html');
        });
};