import "cross-fetch/polyfill";

import ApolloClient from "apollo-boost";
import { InMemoryCache, IntrospectionFragmentMatcher } from "apollo-cache-inmemory";
import axios, { AxiosRequestConfig } from "axios";
import _ from "lodash";

import introspectionQueryResultData from "./githubFragmentTypes.json";

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
});

const cache = new InMemoryCache({ fragmentMatcher });
export const GitHubAPI = new ApolloClient({
  uri: "https://api.github.com/graphql",
  cache,
});

const url = "https://api.github.com";

export function getGitHubAPIv3<T = any>(
  path: string,
  config?: AxiosRequestConfig
) {
  return axios.get<T>(
    `${url}${path}`,
    _.merge(
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      },
      config
    )
  );
}
