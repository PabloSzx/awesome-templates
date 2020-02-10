import "dotenv/config";

import Fastify from "fastify";
import FastifyCookie from "fastify-cookie";
import GQL from "fastify-gql";
import FastifyJWT from "fastify-jwt";
import { readFile } from "fs";
import { resolve } from "path";

import { SECRET } from "./constants";
import { context } from "./graphql/context";

const app = Fastify();

app.register(FastifyCookie, {
  secret:
    process.env.SECRET_COOKIE ??
    (() => {
      console.warn("Please use SECRET env variable");
      return "SlqsmG0Px9ZqgUvmgCC0pNStWh";
    })(),
});

app.register(FastifyJWT, {
  secret: SECRET,
});

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`;

const resolvers = {
  Query: {
    add: async (_: any, { x, y }: any) => x + y,
  },
};

app.register(GQL, {
  schema,
  resolvers,
  jit: 1,
  prefix: "/api",
  graphiql: 123,
  context,
});

app.get("/playground", function(_req, reply) {
  readFile(
    resolve(__dirname, "../static/playground.html"),
    {
      encoding: "utf8",
    },
    (err, data) => {
      if (err) {
        throw err;
      }
      reply.type("text/html").send(data);
    }
  );
});

app.listen(4000, () => {
  console.log("API Listening!");
});
