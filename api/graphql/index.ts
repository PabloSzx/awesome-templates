import "reflect-metadata";

import express from "express";

import { apollo, auth, common } from "../../src/server";

const app = express();

app.use(common);

app.use(auth);

apollo(app);

export default app;
