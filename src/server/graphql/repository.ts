import gql from "graphql-tag";

import { Language, RepositoryGithubData, UserGitHubData } from "../entities";

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
    } | null;
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
      languages(
        first: 10
        orderBy: { field: SIZE, direction: DESC }
        after: $after
      ) {
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
  repository: RepositoryGithubData;
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

export type IRepositoryStarCountQuery = {
  repository: {
    stargazers: {
      totalCount: number;
    };
  };
};

export type IRepositoryStarCountQueryVariables = {
  name: string;
  owner: string;
};

export const RepositoryStarCountQuery = gql`
  query repository($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      id
      stargazers {
        totalCount
      }
    }
  }
`;
