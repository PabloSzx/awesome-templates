import gql from "graphql-tag";
import { NextPage } from "next";
import { useContext, useEffect } from "react";

import { useLazyQuery } from "@apollo/react-hooks";

import { AuthContext } from "../src/client/Components/Auth/Context";
import { GitHubAPI } from "../src/utils";

const GitHub: NextPage = () => {
  const { user, loading: userLoading } = useContext(AuthContext);

  const [fetchAPI, { loading, data, called }] = useLazyQuery(
    gql`
      query {
        viewer {
          id
          avatarUrl
          login
          url
          email
          name
          bio
          repositories(last: 100, privacy: PUBLIC) {
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
          starredRepositories(last: 100) {
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
            }
          }
          organizations(first: 20) {
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
              description
              websiteUrl
              repositories(last: 100, privacy: PUBLIC) {
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
                  languages(first: 20) {
                    totalCount
                    nodes {
                      color
                      id
                      name
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              }
              membersWithRole(first: 30) {
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
        }
      }
    `,
    {
      client: GitHubAPI,
      context: {
        headers:
          user && user.accessToken
            ? {
                Authorization: `bearer ${user.accessToken}`,
              }
            : {},
      },
      ssr: false,
    }
  );

  useEffect(() => {
    if (user && user.accessToken) {
      fetchAPI();
    }
  }, [user]);

  return userLoading || !(user && user.accessToken) ? (
    <div>Loading User...</div>
  ) : user ? (
    loading || !called ? (
      <div>Loading Query...</div>
    ) : (
      <div>{JSON.stringify(data)}</div>
    )
  ) : (
    <div>Not allowed</div>
  );
};

export default GitHub;
