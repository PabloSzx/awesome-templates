import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { values } from "lodash";
import { buildSchemaSync } from "type-graphql";
import { Container as container } from "typedi";

import * as resolvers from "./redesign/resolvers";
import { authChecker, buildContext } from "./utils";

const apolloServer = new ApolloServer({
  schema: buildSchemaSync({
    resolvers: values(resolvers),
    container,
    authChecker,
  }),
  introspection: true,
  playground: {
    settings: {
      "request.credentials": "include",
    },
  },
  context: ({ req }) => buildContext({ req }),
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

export const apollo = (app: Express) => {
  apolloServer.applyMiddleware({
    app,
    path: "/api/graphql",
  });
};
