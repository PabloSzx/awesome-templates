import { Router } from "express";
import morgan from "morgan";

export const common = Router();

common.use(
  morgan("combined", {
    skip: (req, res) => {
      if (process.env.NODE_ENV !== "production") {
        if (req.url.match(/.*\/static.*/)) {
          return true;
        }
        if (req.url.match(/(?=\/_next\/.*)/)) {
          return true;
        }
        if (req.originalUrl.match(/\/api\/graphql/) && res.statusCode === 200) {
          return true;
        }
      }

      return false;
    },
  })
);
