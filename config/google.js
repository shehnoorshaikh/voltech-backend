import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        const hashedPassword = await bcrypt.hash("google-login", 10);
        user = await User.create({
          userName: profile.displayName,
          email: profile.emails[0].value,
          password: hashedPassword,
        });
      }
      console.log(profile);
      done(null, user);
    }
  )
);
