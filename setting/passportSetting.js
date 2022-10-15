const passport =  require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const User = require('../models/user');
const config = require('./config');

const localOptions = { usernameField: 'email' };

// const localLogin = new LocalStrategy(localOptions, async function(email, password, done) {
//     // try {
//     //     const user = await User.findOne({ email });
//     //
//     //     if (!user) {
//     //         return done(null, false, { error: 'User with this email is not exist' });
//     //     }
//     //
//     //     user.comparePassword(password, function(err, isMatch) {
//     //         if (err) {
//     //             return done(err);
//     //         }
//     //
//     //         if (!isMatch) {
//     //             return done(null, false, { error: "Invalid passport" });
//     //         }
//     //
//     //         return done(null, user);
//     //     });
//     // } catch (err) {
//     //     done(err);
//     // }
//     User.findOne({ email })
//         .then(user => {
//             if(!user) {
//                 return done(null, false, { error: 'User with this email is not exist' });
//             }
//
//             user.comparePassword(password, function(err, isMatch) {
//                 if (err) {
//                     return done(err);
//                 }
//
//                 if (!isMatch) {
//                     return done(null, false, { error: "Invalid passport" });
//                 }
//
//                 return done(null, user);
//             });
//         })
//         .catch(err => done(err));
// });
//
// const jwtOptions = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: config.secret
// };
//
//
// const jwtLogin = new JwtStrategy(jwtOptions, function(jwtPayload, done) {
//     // try {
//     //     const user = await User.findById(jwtPayload._id)
//     //
//     //     if (user) {
//     //         done(null, user);
//     //     } else {
//     //         done(null, false);
//     //     }
//     // } catch (err) {
//     //     done(err, false);
//     // }
//   User.findById(jwtPayload._id)
//     .then(user => {
//       if (user) {
//         done(null, user);
//       } else {
//         done(null, false);
//       }
//     })
//     .catch(err => done(err, false));
//   })
//
//
// passport.use(jwtLogin);
// passport.use(localLogin);


passport.use(new LocalStrategy(localOptions, async (email, password, cb) => {
    try {
        const user = await User.findOne({email});

        if (!user) {
            return cb(null, false, {message: 'User with such email doesn\'t exist.'});
        }

        user.comparePassword(password, function(err, isMatch) {
            if (err) {
                return cb(err);
            }

            if (!isMatch) {
                return cb(null, false, {error: 'Invalid passport'});
            }
            return cb(null, user);
        });
    } catch (err) {
        return cb(err);
    }
}));

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret,
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (jwtPayload, cb) => {
    try {
        const user = await User.findById(jwtPayload.id);

        if (user) {
            return cb(null, user);
        } else {
            cb(null, false);
        }
    } catch (err) {
        return cb(err);
    }
}));
