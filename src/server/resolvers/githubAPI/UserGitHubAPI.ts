import gql from "graphql-tag";
import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../../utils";
import { APILevel } from "../../consts";
import {
    GitHubOrganization, GitHubRepository, GitHubUser, Language, RepositoryOwner, UserGitHub,
    UserGitHubAPI
} from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => UserGitHubAPI)
export class UserGitHubAPIResolver {
  constructor(
    @InjectRepository(UserGitHub)
    private readonly UserGitHubRepository: Repository<UserGitHub>,
    @InjectRepository(RepositoryOwner)
    private readonly RepositoryOwnerRepository: Repository<RepositoryOwner>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
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
    this.RepositoryOwnerRepository.save({
      ...viewer,
      user: viewer,
    });

    return viewer;
  }

  @Authorized(APILevel.ADVANCED)
  @Query(() => UserGitHubAPI, { nullable: true })
  async user(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("login") login: string
  ) {
    const {
      data: { user },
    } = await GitHubAPI.query<
      {
        user: GitHubUser | null;
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

    if (user) {
      this.UserGitHubRepository.save(user);
      this.RepositoryOwnerRepository.save({
        ...user,
        user,
      });
    }

    return user;
  }

  @FieldResolver()
  async repositories(
    @Root() { id, login }: UserGitHub,
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { defaultValue: undefined, nullable: true })
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
                    name
                    color
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
            if (repo && repo.createdAt && repo.updatedAt) {
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

    (async () => {
      await this.LanguageRepository.createQueryBuilder()
        .insert()
        .orIgnore()
        .values(
          _.uniqWith(
            _.compact(_.map(repositories, v => v.primaryLanguage)),
            _.isEqual
          )
        )
        .execute();
      this.UserGitHubRepository.save({ id, repositories });
    })();

    return _.filter(repositories, repo =>
      isTemplate !== undefined ? repo.isTemplate === isTemplate : true
    );
  }

  @FieldResolver()
  async starredRepositories(
    @Root() { id, login }: UserGitHub,
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { defaultValue: undefined, nullable: true })
    isTemplate: boolean
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
              starredRepositories(
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
                    name
                    color
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
            if (repo && repo.createdAt && repo.updatedAt) {
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

    (async () => {
      await this.LanguageRepository.createQueryBuilder()
        .insert()
        .orIgnore()
        .values(
          _.uniqWith(
            _.compact(_.map(starredRepositories, v => v.primaryLanguage)),
            _.isEqual
          )
        )
        .execute();
      this.UserGitHubRepository.save({ id, starredRepositories });
    })();

    return _.filter(starredRepositories, repo =>
      isTemplate !== undefined ? repo.isTemplate === isTemplate : true
    );
  }

  @FieldResolver()
  async organizations(
    @Ctx() { authGitHub: context }: IContext,
    @Root() { id, login }: GitHubUser
  ) {
    const {
      data: {
        user: {
          organizations: { nodes: organizations },
        },
      },
    } = await GitHubAPI.query<
      {
        user: {
          organizations: {
            nodes: Array<GitHubOrganization>;
          };
        };
      },
      {
        login: string;
      }
    >({
      query: gql`
        query($login: String!) {
          user(login: $login) {
            id
            organizations(first: 50) {
              nodes {
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
        }
      `,
      variables: {
        login,
      },
      context,
    });

    this.UserGitHubRepository.save({
      id,
      organizations,
    });

    return organizations;
  }
}
