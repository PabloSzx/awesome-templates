import { values } from "lodash";
import { Container } from "typedi";
import { ConnectionOptions, createConnection, useContainer } from "typeorm";

import * as entities from "../entities/db";

const dbConfig: ConnectionOptions = {
  type: "postgres",
  entities: values(entities),
  ...(process.env.DB_URL
    ? {
        url: process.env.DB_URL,
        database: process.env.DB_DATABASE || "awesome-templates-dev",
      }
    : {
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || "postgres",
        port: parseInt(process.env.DB_PORT || "") || 5432,
      }),
  synchronize: true,
  logging: process.env.NODE_ENV !== "production",
  logger: "file",
};

useContainer(Container);

export const connection = createConnection(dbConfig);
