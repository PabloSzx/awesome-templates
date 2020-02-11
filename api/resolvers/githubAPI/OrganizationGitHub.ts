import gql from "graphql-tag";
import _ from "lodash";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { APILevel } from "../../consts";
import {
  GitHubOrganization,
  GitHubRepository,
  GitHubUser,
  GitRepositoryModel,
  OrganizationGitHub,
  OrganizationModel,
  RepositoryOwnerModel,
  UserGitHubModel,
} from "../../entities";
import { IContext } from "../../interfaces";
import { GitHubAPI } from "../../utils";

@Resolver(() => OrganizationGitHub)
export class OrganizationGitHubResolver {
  @Authorized(APILevel.ADVANCED)
  @Query(() => OrganizationGitHub, { nullable: true })
  async organization(
    @Ctx() { authGitHub }: IContext,
    @Arg("login") login: string
  ) {
    const { organization } = await GitHubAPI.query<
      {
        organization: GitHubOrganization | null;
      },
      {
        login: string;
      }
    >(
      gql`
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
      `,
      authGitHub,
      {
        login,
      }
    );

    if (organization) {
      const newOrg = await OrganizationModel.findOneAndUpdate(
        {
          githubId: organization.id,
        },
        organization,
        {
          upsert: true,
          new: true,
        }
      );

      await RepositoryOwnerModel.findOneAndUpdate(
        {
          githubId: organization.id,
        },
        {
          organization: newOrg._id,
          ...organization,
        }
      );
    }

    return organization;
  }

  @FieldResolver()
  async members(
    @Ctx() { authGitHub }: IContext,
    @Root() { login, id }: GitHubOrganization
  ) {
    let after: string | undefined;
    let hasNextPage: boolean;

    let members: GitHubUser[] = [];

    do {
      const { organization } = await GitHubAPI.query<
        {
          organization: {
            membersWithRole: {
              pageInfo: {
                endCursor: string | undefined;
                hasNextPage: boolean;
              };
              nodes: Array<GitHubUser>;
            };
          };
        },
        {
          login: string;
          after: string | undefined;
        }
      >(
        gql`
          query($login: String!, $after: String) {
            organization(login: $login) {
              id
              membersWithRole(first: 100, after: $after) {
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
        `,
        authGitHub,
        {
          login,
          after,
        }
      );

      members.push(...organization.membersWithRole.nodes);
      after = organization.membersWithRole.pageInfo.endCursor;
      hasNextPage = organization.membersWithRole.pageInfo.hasNextPage;
    } while (hasNextPage);

    const membersDocs = await Promise.all(
      members.map(member => {
        return UserGitHubModel.findOneAndUpdate(
          {
            githubId: member.id,
          },
          member,
          {
            upsert: true,
            new: true,
          }
        );
      })
    );

    await OrganizationModel.findOneAndUpdate(
      {
        githubId: id,
      },
      {
        members: membersDocs,
      },
      {
        new: true,
      }
    );

    return members;
  }

  @FieldResolver()
  async repositories(
    @Ctx() { authGitHub }: IContext,
    @Root() { login, id }: GitHubOrganization,
    @Arg("isTemplate", { defaultValue: undefined, nullable: true })
    isTemplate: boolean
  ) {
    let after: string | undefined;
    let hasNextPage: boolean;

    let repositories: GitHubRepository[] = [];

    do {
      const {
        organization: {
          repositories: { nodes, pageInfo },
        },
      } = await GitHubAPI.query<
        {
          organization: {
            repositories: {
              pageInfo: {
                endCursor: string | undefined;
                hasNextPage: boolean;
              };
              nodes: Array<GitHubRepository>;
            };
          };
        },
        {
          login: string;
          after: string | undefined;
        }
      >(
        gql`
          query($login: String!, $after: String) {
            organization(login: $login) {
              id
              repositories(
                first: 100
                privacy: PUBLIC
                after: $after
                orderBy: { direction: DESC, field: STARGAZERS }
              ) {
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
        `,
        authGitHub,
        {
          login,
          after,
        }
      );

      repositories.push(
        ..._.compact(
          _.map(nodes, repo => {
            if (
              repo &&
              repo.createdAt &&
              repo.updatedAt &&
              (isTemplate !== undefined ? repo.isTemplate === isTemplate : true)
            ) {
              return {
                ...repo,
                createdAt: new Date(repo.createdAt),
                updatedAt: new Date(repo.updatedAt),
              };
            }
            return undefined;
          })
        )
      );

      after = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    } while (hasNextPage);

    const repositoriesDocs = await Promise.all(
      repositories.map(repo => {
        return GitRepositoryModel.findOneAndUpdate(
          {
            githubId: repo.id,
          },
          repo,
          {
            upsert: true,
            new: true,
          }
        );
      })
    );

    await OrganizationModel.findOneAndUpdate(
      {
        githubId: id,
      },
      {
        repositories: repositoriesDocs,
      },
      {
        new: true,
      }
    );

    return repositories;
  }
}
