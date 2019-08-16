import gql from "graphql-tag";

import { GitRepository } from "../entities";

export type IViewerReposQuery = {
  viewer: {
    resourcePath: string;
    repositories: {
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      nodes: Array<GitRepository>;
    };
  };
};

export type IViewerReposQueryVariables = {
  after: string | undefined;
};

export const ViewerReposQuery = gql`
  query repositories($after: String) {
    viewer {
      id
      resourcePath
      repositories(first: 100, privacy: PUBLIC, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          createdAt
          updatedAt
          isLocked
          isArchived
          isDisabled
          isFork
          isTemplate
          forkCount
          name
          nameWithOwner
          resourcePath
          primaryLanguage {
            color
            id
            name
          }
          description
          url
        }
      }
    }
  }
`;

export type IViewerDataQuery = {
  viewer: {
    id: string;
    avatarUrl: string;
    login: string;
    url: string;
    email: string;
    name: string;
    bio: string;
    resourcePath: string;
  };
};

export const ViewerDataQuery = gql`
  query {
    viewer {
      id
      avatarUrl
      login
      url
      email
      name
      bio
      resourcePath
    }
  }
`;
