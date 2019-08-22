import axios from "axios";
import { Router } from "express";
import ExpressSession from "express-session";
import passport from "passport";
import requireEnv from "require-env-variable";
import { Repository } from "typeorm";
import { TypeormStore } from "typeorm-store";

import { WRONG_INFO } from "../consts";
import { connection } from "../db";
import { Session, User } from "../entities";

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, COOKIE_KEY } = requireEnv([
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "COOKIE_KEY",
]);
export const auth = Router();

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

passport.serializeUser<User, string>((user, cb) => {
  if (user) cb(null, user.id);
  else cb(WRONG_INFO);
});

passport.deserializeUser<User | null, string>(async (id, done) => {
  try {
    const UserRepository = (await connection).getRepository(User);

    const user = await UserRepository.findOne(id);

    if (user) {
      done(null, user);
    } else {
      done(null, null);
    }
  } catch (err) {
    console.error(err);
  }
});

auth.use("/api/login/github", async (req, res) => {
  try {
    const { code } = req.query as {
      code: string | undefined;
    };
    if (!code) {
      return res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`
      );
    }

    const {
      data: { access_token: accessToken },
    } = await axios.post<{
      access_token: string;
      token_type: string;
      scope: string;
    }>(`https://github.com/login/oauth/access_token`, undefined, {
      params: {
        code,
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
      },
      headers: {
        Accept: "application/json",
      },
    });

    const {
      data: {
        email,
        avatar_url: avatarUrl,
        url,
        login,
        name,
        bio,
        node_id: id,
        ...restData
      },
    } = await axios.get<{
      email: string;
      avatar_url: string;
      login: string;
      name: string;
      url: string;
      bio: string;
      node_id: string;
    }>(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    console.log("restData", restData);

    const UserRepository = (await connection).getRepository(User);

    const userGitHubData = {
      id,
      avatarUrl,
      login,
      url,
      name,
      email,
      bio,
    };
    let user = UserRepository.create({
      ...userGitHubData,
      accessToken,
      userGitHubData,
    });

    user = await UserRepository.save(user);

    req.login(user, err => {
      if (err) {
        console.error(err);
      }
      res.redirect("/");
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

export const requireAuth = Router();
requireAuth.use(auth, (req, res, next) => {
  if (req.user && req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(403);
});
