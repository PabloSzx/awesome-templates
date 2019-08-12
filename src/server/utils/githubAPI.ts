import "cross-fetch/polyfill";

import ApolloClient from "apollo-boost";

export default new ApolloClient({
  uri: "https://api.github.com/graphql",
});
