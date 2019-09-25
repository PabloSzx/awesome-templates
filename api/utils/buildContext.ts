import { Request, Response } from "express";

import { APILevel as APILevelEnum } from "../consts";
import { User } from "../entities";

const promisifiedLogin = <T = any, S = any>(
  req: Request,
  user: T,
  options: S
) =>
  new Promise((resolve, reject) =>
    req.login(user, options, err => {
      if (err) reject(err);
      else resolve();
    })
  );

export const buildContext = <OptionsType = any>({
  req,
  res,
}: {
  req: Request;
  res: Response;
}) => {
  return {
    login: (user: User, options?: OptionsType) =>
      promisifiedLogin(req, user, options),
    logout: () => {
      req.logout();
      if (req.session) {
        req.session.destroy(err => {
          if (err) console.error(err);
        });
      }
      res.clearCookie("connect.sid");
    },
    isAuthenticated: () => req.isAuthenticated(),
    isUnauthenticated: () => req.isUnauthenticated(),
    get user(): User {
      return req.user as User;
    },
    get authGitHub() {
      const {
        accessToken,
        personalAccessToken,
        APILevel,
      } = (req.user as User) || {
        accessToken: "",
        personalAccessToken: "",
        APILevel: APILevelEnum.BASIC,
      };

      return APILevel === APILevelEnum.ADVANCED && personalAccessToken
        ? personalAccessToken
        : accessToken;
    },
  };
};
