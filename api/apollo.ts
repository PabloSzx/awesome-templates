import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { buildSchema, registerEnumType } from "type-graphql";

import { APILevel } from "./consts";
import * as resolvers from "./resolvers";
import { authChecker, buildContext } from "./utils";

registerEnumType(APILevel, {
  name: "APILevel",
});

export const apollo = async (app: Express) => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [...Object.values(resolvers)],
      authChecker,
      emitSchemaFile: process.env.NODE_ENV !== "production",
    }),
    introspection: true,
    playground: {
      settings: {
        "request.credentials": "include",
      },
    },
    context: ({ req, res }) => buildContext({ req, res }),
    formatError: err => {
      switch (err.message) {
        case "GraphQL error: Resource not accessible by integration": {
          return new Error("Make sure the app is installed on your account!");
        }
        default:
          return err;
      }
    },
  });
  apolloServer.applyMiddleware({
    app,
    path: "/api/graphql",
  });
};
