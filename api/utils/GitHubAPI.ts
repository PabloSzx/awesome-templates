import "cross-fetch/polyfill";

import axios, { AxiosRequestConfig } from "axios";
import { DocumentNode, print } from "graphql";
import { GraphQLClient } from "graphql-request";
import _ from "lodash";

class GitHubAPIv4 {
  client: GraphQLClient = new GraphQLClient("https://api.github.com/graphql");
  query = async <DATA = any, VARIABLES extends Record<string, any> = any>(
    tag: DocumentNode,
    token: string,
    variables?: VARIABLES
  ) =>
    await this.client
      .setHeader("Authorization", `token ${token}`)
      .request<DATA>(print(tag), variables);
}
export const GitHubAPI = new GitHubAPIv4();

export function getGitHubAPIv3<T = any>(
  path: string,
  config?: AxiosRequestConfig
) {
  return axios.get<T>(
    `https://api.github.com${path}`,
    _.merge(
      {
        headers: {
          // Accept: "application/vnd.github.v3+json",
          Accept: "application/vnd.github.machine-man-preview+json",
        },
      },
      config
    )
  );
}
