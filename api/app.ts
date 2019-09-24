import "reflect-metadata";

import express from "express";

import { apollo } from "./apollo";
import { auth, common } from "./middleware";

const app = express();

app.use(common);

app.use(auth);

apollo(app);

export default app;
