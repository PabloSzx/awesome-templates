import gql from "graphql-tag";
import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../../../utils";
import { APILevel } from "../../../consts";
import { IContext } from "../../../interfaces";
import { GitHubRepository, GitHubUser, UserGitHub, UserGitHubAPI } from "../../entities";

@Resolver(() => UserGitHubAPI)
export class UserGitHubAPIResolver {
  constructor(
    @InjectRepository(UserGitHub)
    private readonly UserGitHubRepository: Repository<UserGitHub>
  ) {}

  @Authorized(APILevel.MEDIUM)
  @Query(() => UserGitHubAPI)
  async viewer(@Ctx() { authGitHub: context }: IContext) {
    const {
      data: { viewer },
    } = await GitHubAPI.query<{
      viewer: GitHubUser;
    }>({
      query: gql`
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
      `,
      context,
    });

    this.UserGitHubRepository.save(viewer);

    return viewer;
  }

  @Authorized(APILevel.ADVANCED)
  @Query(() => UserGitHubAPI)
  async user(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("login") login: string
  ) {
    const {
      data: { user },
    } = await GitHubAPI.query<
      {
        user: GitHubUser;
      },
      {
        login: string;
      }
    >({
      query: gql`
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
      `,
      context,
      variables: {
        login,
      },
    });

    this.UserGitHubRepository.save(user);

    return user;
  }

  @FieldResolver()
  async repositories(
    @Root() { id, login }: UserGitHub,
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { defaultValue: undefined })
    isTemplate: boolean
  ) {
    let repositories: GitHubRepository[] = [];

    let after: string | undefined;

    let hasNextPage: boolean;

    do {
      const {
        data: {
          user: {
            repositories: { nodes, pageInfo },
          },
        },
      } = await GitHubAPI.query<
        {
          user: {
            repositories: {
              pageInfo: {
                hasNextPage: boolean;
                endCursor: string;
              };
              nodes: GitHubRepository[];
            };
          };
        },
        {
          after: string | undefined;
          login: string;
        }
      >({
        query: gql`
          query repositories($after: String, $login: String!) {
            user(login: $login) {
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
        variables: {
          login,
          after,
        },
        context,
      });

      repositories.push(
        ..._.compact(
          _.map(nodes, repo => {
            if (
              repo &&
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

      hasNextPage = pageInfo.hasNextPage;
      after = pageInfo.endCursor;
    } while (hasNextPage);

    this.UserGitHubRepository.save({
      id,
      repositories,
    });

    return repositories;
  }

  @FieldResolver()
  async starredRepositories(
    @Root() { id, login }: UserGitHub,
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { defaultValue: undefined })
    isTemplate: boolean | undefined
  ) {
    let starredRepositories: GitHubRepository[] = [];

    let after: string | undefined;

    let hasNextPage: boolean;

    do {
      const {
        data: {
          user: {
            starredRepositories: { nodes, pageInfo },
          },
        },
      } = await GitHubAPI.query<
        {
          user: {
            starredRepositories: {
              pageInfo: {
                hasNextPage: boolean;
                endCursor: string;
              };
              nodes: GitHubRepository[];
            };
          };
        },
        {
          after: string | undefined;
          login: string;
        }
      >({
        query: gql`
          query repositories($after: String, $login: String!) {
            user(login: $login) {
              id
              repositories(
                first: 100
                after: $after
                orderBy: { direction: DESC, field: STARRED_AT }
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
        variables: {
          login,
          after,
        },
        context,
      });

      starredRepositories.push(
        ..._.compact(
          _.map(nodes, repo => {
            if (
              repo &&
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

      hasNextPage = pageInfo.hasNextPage;
      after = pageInfo.endCursor;
    } while (hasNextPage);

    this.UserGitHubRepository.save({
      id,
      starredRepositories,
    });

    return starredRepositories;
  }
}
