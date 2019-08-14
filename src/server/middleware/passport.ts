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

passport.deserializeUser<User, string>(async (id, done) => {
  try {
    const UserRepository = (await connection).getRepository(User);

    const user = await UserRepository.findOne(id);

    done(null, user);
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
      data: { email, id, avatar_url: avatarUrl, url, login, name, ...restData },
    } = await axios.get<{
      email: string;
      id: string;
      avatar_url: string;
      login: string;
      name: string;
      url: string;
    }>(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    console.log("restData", restData);

    const UserRepository = (await connection).getRepository(User);

    let user = await UserRepository.findOne(id);

    if (user) {
      UserRepository.update(id, {
        id,
        avatarUrl,
        login,
        url,
        name,
        email,
        accessToken,
      });
      user = {
        ...user,
        id,
        avatarUrl,
        login,
        url,
        name,
        email,
        accessToken,
      };
    } else {
      user = UserRepository.create({
        id,
        avatarUrl,
        login,
        url,
        name,
        email,
        accessToken,
      });

      await UserRepository.save(user);
    }
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
