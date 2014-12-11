/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/attachments', require('./api/attachment'));
  app.use('/api/links', require('./api/link'));
  app.use('/api/records', require('./api/record'));
  app.use('/api/onviewrefs', require('./api/onviewref'));
  app.use('/api/notes', require('./api/note'));
  app.use('/api/views', require('./api/view'));
  app.use('/api/contributions', require('./api/contribution'));
  app.use('/api/things', require('./api/thing'));
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
