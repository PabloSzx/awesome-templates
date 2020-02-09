import Fastify from "fastify";
import GQL from "fastify-gql";
import { readFile } from "fs";
import { resolve } from "path";

const app = Fastify();

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
});

app.get("/playground", function(_req, reply) {
  readFile(
    resolve(__dirname, "../../static/playground.html"),
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
  console.log("API Listening!" + Date.now());
});
