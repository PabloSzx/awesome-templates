import gql from "graphql-tag";

import { Language, RepositoryGithubData, RepositoryOwner, UserGitHubData } from "../entities";

export type IViewerReposQuery = {
  viewer: {
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

export type IViewerReposQueryVariables = {
  after: string | undefined;
};

export const ViewerReposQuery = gql`
  query repositories($after: String) {
    viewer {
      id
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

export type IRepositoryStarsQuery = {
  repository: {
    stargazers: {
      totalCount: number;
      pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
      };
      nodes: Array<UserGitHubData>;
    };
  };
};

export type IRepositoryStarsQueryVariables = {
  name: string;
  owner: string;
  after: string | undefined;
};

export const RepositoryStarsQuery = gql`
  query repository($name: String!, $owner: String!, $after: String) {
    repository(name: $name, owner: $owner) {
      id
      stargazers(first: 100, after: $after) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          avatarUrl
          login
          url
          email
          name
          bio
        }
      }
    }
  }
`;

export type IRepositoryLanguagesQuery = {
  repository: {
    languages: {
      totalCount: number;
      pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
      };
      nodes: Array<Language>;
    };
  };
};

export type IRepositoryLanguagesQueryVariables = {
  name: string;
  owner: string;
  after: string | undefined;
};

export const RepositoryLanguagesQuery = gql`
  query repository($name: String!, $owner: String!, $after: String) {
    repository(name: $name, owner: $owner) {
      id
      languages(first: 100, after: $after) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          name
          color
        }
      }
    }
  }
`;

export type IRepositoryDataQuery = {
  repository: {
    owner: RepositoryOwner;
  } & RepositoryGithubData;
};

export type IRepositoryDataQueryVariables = {
  name: string;
  owner: string;
};

export const RepositoryDataQuery = gql`
  query repository($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
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
`;
