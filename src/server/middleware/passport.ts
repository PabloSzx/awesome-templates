import { Router } from "express";
import ExpressSession from "express-session";
import _ from "lodash";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import requireEnv from "require-env-variable";
import { Repository } from "typeorm";
import { TypeormStore } from "typeorm-store";

import { LOCAL_PATH, WRONG_INFO } from "../consts";
import { connection } from "../db";
import { Session, User } from "../entities";

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = requireEnv([
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
]);
export const auth = Router();

const { COOKIE_KEY } = requireEnv(["COOKIE_KEY"]);

function SessionMiddleware(repository: Repository<Session>) {
  return ExpressSession({
    secret: COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 86400000, secure: false },
    store: new TypeormStore({ repository }),
  });
}

auth.use(async (req, res, next) => {
  SessionMiddleware((await connection).getRepository(Session))(req, res, next);
});

auth.use(passport.initialize());
auth.use(passport.session());

passport.serializeUser<User, number>((user, cb) => {
  if (user) cb(null, user.id);
  else cb(WRONG_INFO);
});

passport.deserializeUser<User, number>(async (id, done) => {
  try {
    const UserRepository = (await connection).getRepository(User);

    const user = await UserRepository.findOne(id);

    done(null, user);
  } catch (err) {
    console.error(err);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: LOCAL_PATH + "api/login/github/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      console.log("profile", profile);
      try {
        const { _json, displayName, emails, username, profileUrl } = profile;
        const { email = "<hidden>", id, avatar_url } = _json as {
          email: string;
          id: number;
          avatar_url: string;
        };

        const UserRepository = (await connection).getRepository(User);

        let user = await UserRepository.findOne(id);

        if (user) {
          UserRepository.update(id, {
            email,
            emails: _.map(emails, v => v.value),
            username,
            displayName,
            profileUrl,
            avatar_url,
            accessToken,
            refreshToken,
          });
          return cb(null, user);
        } else {
          user = await UserRepository.create({
            id,
            email,
            emails: _.map(emails, v => v.value),
            username,
            displayName,
            profileUrl,
            avatar_url,
            accessToken,
            refreshToken,
          });

          await UserRepository.save(user);
          return cb(null, user);
        }
      } catch (err) {
        cb(err.message || _.toString(err));
      }
    }
  )
);

auth.get("/api/login/github", passport.authenticate("github"));

auth.get(
  "/api/login/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: "/",
  })
);

export const requireAuth = Router();
requireAuth.use(auth, (req, res, next) => {
  if (req.user && req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(403);
});
