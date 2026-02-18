const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = {
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: 'google-auth-no-password' // Placeholder for OAuth users
                    };
                    user = await User.create(newUser);
                    return done(null, user);
                }
            } catch (err) {
                console.error('Google OAuth Error:', err);
                return done(err, null);
            }
        }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
