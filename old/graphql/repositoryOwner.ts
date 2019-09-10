import gql from "graphql-tag";

import { OrganizationGithubData, UserGitHubData } from "../entities";

export type IRepositoryOwnerQueryData = {
  node:
    | { __typename: "User" } & UserGitHubData
    | { __typename: "Organization" } & OrganizationGithubData
    | null;
};

export type IRepositoryOwnerQueryDataVariables = {
  id: string;
};

export const RepositoryOwnerQueryData = gql`
  query($id: ID!) {
    node(id: $id) {
      __typename
      ... on User {
        id
        avatarUrl
        login
        url
        email
        name
        bio
      }
      ... on Organization {
        id
        avatarUrl
        login
        url
        email
        name
        description
        websiteUrl
      }
    }
  }
`;
