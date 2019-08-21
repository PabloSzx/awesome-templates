import gql from "graphql-tag";

import { RepositoryGithubData } from "../entities";

export type ISearchRepositoryQuery = {
  search: {
    nodes: Array<RepositoryGithubData>;
  };
};

export type ISearchRepositoryQueryVariables = {
  input: string;
};

export const SearchRepositoryQuery = gql`
  query search($input: String!) {
    search(type: REPOSITORY, query: $input, first: 50) {
      nodes {
        ... on Repository {
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
