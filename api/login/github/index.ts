import express from "express";

import { auth, common } from "../../../src/server";

const app = express();

app.use(common);

app.use(auth);


export default app;
