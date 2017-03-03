var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function(User, config) {
    passport.use(new LocalStrategy({
            usernameField: 'userName',
            passwordField: 'password' // this is the virtual field on the model
        },
        function(userName, password, done) {
            User.findOne({
              provider: 'local',
              userName: userName
            }, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false, {
                        message: 'This userName is not registered.'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'This password is not correct.'
                    });
                }
                return done(null, user);
            });
        }
    ));
};
