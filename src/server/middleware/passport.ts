import axios from "axios";
import connectRedis from "connect-redis";
import { Router } from "express";
import ExpressSession from "express-session";
import passport from "passport";
import redis from "redis";
import requireEnv from "require-env-variable";

import { WRONG_INFO } from "../../consts";
import { DOMAIN } from "../../consts/domain";
import { connection } from "../db";
import { User } from "../entities";

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  COOKIE_KEY,
  REDIS_URL,
  NODE_ENV,
} = requireEnv([
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "COOKIE_KEY",
  "REDIS_URL",
  "NODE_ENV",
]);
export const auth = Router();

const RedisStore = connectRedis(ExpressSession);
const client = redis.createClient({
  url: REDIS_URL,
  db: NODE_ENV === "production" ? 1 : 0,
});

auth.use(
  ExpressSession({
    store: new RedisStore({ client }),
    secret: COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 1209600000, secure: false },
  })
);

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
        `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${DOMAIN}/api/login/github`
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

    let {
      data: {
        email,
        avatar_url: avatarUrl,
        html_url: url,
        login,
        name,
        bio,
        node_id: id,
        ...restData
      },
    } = await axios.get<{
      email: string | undefined;
      avatar_url: string;
      login: string;
      name: string;
      html_url: string;
      bio: string;
      node_id: string;
    }>(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    email = email || "";

    console.log("restData", restData);

    const UserRepository = (await connection).getRepository(User);

    const data = {
      id,
      avatarUrl,
      login,
      url,
      name,
      email,
      bio,
    };
    let user: User = UserRepository.create({
      id,
      accessToken,
      data,
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
