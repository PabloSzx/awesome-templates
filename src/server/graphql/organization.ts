import gql from "graphql-tag";

import { OrganizationGithubData, RepositoryGithubData, UserGitHubData } from "../entities";

export type IOrganizationDataQuery = {
  organization: OrganizationGithubData;
};

export type IOrganizationDataQueryVariables = {
  login: string;
};

export const OrganizationDataQuery = gql`
  query organization($login: String!) {
    organization(login: $login) {
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
`;

export type IOrganizationReposQuery = {
  organization: {
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

export type IOrganizationReposQueryVariables = {
  after: string | undefined;
  login: string;
};

export const OrganizationReposQuery = gql`
  query repositories($after: String, $login: String!) {
    organization(login: $login) {
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

export type IOrganizationMembersQuery = {
  organization: {
    members: {
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      nodes: Array<UserGitHubData>;
    };
  };
};

export type IOrganizationMembersQueryVariables = {
  after: string | undefined;
  login: string;
};

export const OrganizationMembersQuery = gql`
  query repositories($after: String, $login: String!) {
    organization(login: $login) {
      id
      members: membersWithRole(first: 50, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
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
