import gql from "graphql-tag";

import { RepositoryGithubData, UserGitHubData } from "../entities";

export type IUserReposQuery = {
  user: {
    repositories: {
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      nodes: Array<RepositoryGithubData>;
    };
  };
};

export type IUserReposQueryVariables = {
  after: string | undefined;
  login: string;
};

export const UserReposQuery = gql`
  query repositories($after: String, $login: String!) {
    user(login: $login) {
      id
      repositories(
        first: 100
        privacy: PUBLIC
        after: $after
        orderBy: { direction: DESC, field: STARGAZERS }
      ) {
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
          primaryLanguage {
            color
            id
            name
          }
          description
          url

          owner {
            id
            avatarUrl
            login
            url
          }
        }
      }
    }
  }
`;

export type IUserStarredReposQuery = {
  user: {
    starredRepositories: {
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      nodes: Array<RepositoryGithubData>;
    };
  };
};

export type IUserStarredReposQueryVariables = {
  after: string | undefined;
  login: string;
};

export const UserStarredReposQuery = gql`
  query repositories($after: String, $login: String!) {
    user(login: $login) {
      id
      starredRepositories(
        first: 100
        after: $after
        orderBy: { direction: DESC, field: STARRED_AT }
      ) {
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
          primaryLanguage {
            color
            id
            name
          }
          description
          url

          owner {
            id
            avatarUrl
            login
            url
          }
        }
      }
    }
  }
`;

export type IViewerDataQuery = {
  viewer: UserGitHubData;
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
    }
  }
`;

export type IUserDataQuery = {
  user: UserGitHubData | null;
};

export type IUserDataQueryVariables = {
  login: string;
};

export const UserDataQuery = gql`
  query user($login: String!) {
    user(login: $login) {
      id
      avatarUrl
      login
      url
      email
      name
      bio
    }
  }
`;
