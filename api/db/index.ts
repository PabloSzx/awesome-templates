import "dotenv/config";

import mongoose from "mongoose";

import { setGlobalOptions } from "@typegoose/typegoose";

setGlobalOptions({
  globalOptions: {
    useNewEnum: true,
  },
});

export const mongoUrl = process.env.MONGODB || "mongodb://localhost:27017";

if (process.env.NODE_ENV !== "test") {
  mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
    dbName: "awesome-templates",
    ...(process.env.MONGODB
      ? {
          auth: {
            user: process.env.MONGO_USER ?? "",
            password: process.env.MONGO_PASSWORD ?? "",
          },
        }
      : {}),
  });
}
