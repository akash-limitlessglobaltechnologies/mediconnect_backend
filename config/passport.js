const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ContractUser = require('../Models/userModel');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await ContractUser.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URI}/auth/google/callback`,
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await ContractUser.findOne({ googleId: profile.id });
        
        if (!user) {
            user = new ContractUser({
                googleId: profile.id,
                email: profile.emails[0].value,
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                profilePhoto: profile.photos[0].value,
                role: null
            });
            
            await user.save();
            console.log('New user created:', user);
        }
        
        return done(null, user);
    } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error, null);
    }
}));

module.exports = passport;