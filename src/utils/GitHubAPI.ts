import "cross-fetch/polyfill";

import ApolloClient from "apollo-boost";
import axios from "axios";

export const GitHubAPI = new ApolloClient({
  uri: "https://api.github.com/graphql",
});

const url = "https://api.github.com";

export function getGitHubAPIv3<T = any>(path: string) {
  return axios.get<T>(`${url}${path}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  });
}
