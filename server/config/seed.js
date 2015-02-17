/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
//var Community = require('../api/community/community.model');
//var Contribution = require('../api/contribution/contribution.model');

// User.find({}).remove(function() {
//   User.create({
//     provider: 'local',
//     name: 'Test User',
//     email: 'test@test.com',
//     password: 'test'
//   }, {
//     provider: 'local',
//     role: 'admin',
//     name: 'Admin',
//     email: 'admin@admin.com',
//     password: 'admin'
//   }, function() {
//       console.log('finished populating users');
//     }
//   );
// });

User.find({
    email: 'admin@admin.com'
}, function(err, data) {
    if (data.length <= 0) {
        User.create({
            provider: 'local',
            role: 'admin',
            firstName: 'KF',
            lastName: 'Admin',
            email: 'admin@admin.com',
            password: 'admin'
        });
    }
});