import "cross-fetch/polyfill";

import ApolloClient from "apollo-boost";

export const GitHubAPI = new ApolloClient({
  uri: "https://api.github.com/graphql",
});
