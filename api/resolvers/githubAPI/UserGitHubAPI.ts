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
import { LanguageUpsertDataLoader } from "../../dataloaders/Language";
import {
  GitHubOrganization,
  GitHubRepository,
  GitHubUser,
  GitRepositoryModel,
  LanguageModel,
  OrganizationModel,
  RepositoryOwnerModel,
  UserGitHub,
  UserGitHubAPI,
  UserGitHubModel,
} from "../../entities";
import { IContext } from "../../interfaces";
import { GitHubAPI } from "../../utils";

@Resolver(() => UserGitHubAPI)
export class UserGitHubAPIResolver {
  @Authorized(APILevel.MEDIUM)
  @Query(() => UserGitHubAPI)
  async viewer(@Ctx() { authGitHub }: IContext) {
    const { viewer } = await GitHubAPI.query<{
      viewer: GitHubUser;
    }>(
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
          }
        }
      `,
      authGitHub
    );

    const userGithubDoc = await UserGitHubModel.findOneAndUpdate(
      {
        githubId: viewer.id,
      },
      viewer,
      {
        upsert: true,
        new: true,
      }
    );

    await RepositoryOwnerModel.findOneAndUpdate(
      {
        githubId: viewer.id,
      },
      { ...viewer, user: userGithubDoc },
      {
        upsert: true,
        new: true,
      }
    );

    return viewer;
  }

  @Authorized(APILevel.ADVANCED)
  @Query(() => UserGitHubAPI, { nullable: true })
  async user(@Ctx() { authGitHub }: IContext, @Arg("login") login: string) {
    const { user } = await GitHubAPI.query<
      {
        user: GitHubUser | null;
      },
      {
        login: string;
      }
    >(
      gql`
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
      authGitHub,
      {
        login,
      }
    );

    if (user) {
      const userDoc = await UserGitHubModel.findOneAndUpdate(
        {
          githubId: user.id,
        },
        user,
        {
          upsert: true,
          new: true,
        }
      );

      await RepositoryOwnerModel.findOneAndUpdate(
        {
          githubId: user.id,
        },
        { user: userDoc },
        {
          upsert: true,
          new: true,
        }
      );
    }
    return user;
  }

  @FieldResolver()
  async repositories(
    @Root() { id, login }: GitHubUser,
    @Ctx() { authGitHub }: IContext,
    @Arg("isTemplate", { defaultValue: undefined, nullable: true })
    isTemplate: boolean
  ) {
    const repositories: GitHubRepository[] = [];

    let after: string | undefined;

    let hasNextPage: boolean;

    console.log(147);

    do {
      const {
        user: {
          repositories: { nodes, pageInfo },
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
      >(
        gql`
          query repositories($after: String, $login: String!) {
            user(login: $login) {
              id
              repositories(
                first: 50
                privacy: PUBLIC
                after: $after
                orderBy: { direction: DESC, field: STARGAZERS }
                affiliations: [OWNER]
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
        authGitHub,
        {
          login,
          after,
        }
      );

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

    console.log(243, {
      repositories: repositories.slice(0, 5),
    });

    const repositoriesDocs = await Promise.all(
      repositories.map(
        async ({
          primaryLanguage: primaryLanguageRepo,
          owner: ownerRepo,
          ...repo
        }) => {
          const [primaryLanguage, owner] = await Promise.all([
            primaryLanguageRepo
              ? await LanguageUpsertDataLoader.load(primaryLanguageRepo)
              : undefined,
            UserGitHubModel.findOneAndUpdate(
              {
                githubId: ownerRepo.id,
              },
              ownerRepo,
              {
                upsert: true,
                new: true,
              }
            ),
          ]);
          return await GitRepositoryModel.findOneAndUpdate(
            {
              githubId: repo.id,
            },
            { ...repo, primaryLanguage, owner },
            {
              upsert: true,
              new: true,
            }
          );
        }
      )
    );

    await UserGitHubModel.findOneAndUpdate(
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

    return _.filter(repositories, repo =>
      isTemplate != null ? repo.isTemplate === isTemplate : true
    );
  }

  @FieldResolver()
  async starredRepositories(
    @Root() { id, login }: GitHubUser,
    @Ctx() { authGitHub }: IContext,
    @Arg("isTemplate", { defaultValue: undefined, nullable: true })
    isTemplate: boolean
  ) {
    let starredRepositories: GitHubRepository[] = [];

    let after: string | undefined;

    let hasNextPage: boolean;

    do {
      const {
        user: {
          starredRepositories: { nodes, pageInfo },
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
      >(
        gql`
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
        authGitHub,
        {
          login,
          after,
        }
      );

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

    const starredRepositoriesDocs = await Promise.all(
      starredRepositories.map(
        async ({
          primaryLanguage: primaryLanguageRepo,
          owner: ownerRepo,
          ...repo
        }) => {
          const [primaryLanguage, owner] = await Promise.all([
            primaryLanguageRepo
              ? await LanguageUpsertDataLoader.load(primaryLanguageRepo)
              : undefined,
            UserGitHubModel.findOneAndUpdate(
              {
                githubId: ownerRepo.id,
              },
              ownerRepo,
              {
                upsert: true,
                new: true,
              }
            ),
          ]);
          return await GitRepositoryModel.findOneAndUpdate(
            {
              githubId: repo.id,
            },
            { ...repo, primaryLanguage, owner },
            {
              upsert: true,
              new: true,
            }
          );
        }
      )
    );

    await UserGitHubModel.findOneAndUpdate(
      {
        githubId: id,
      },
      {
        starredRepositories: starredRepositoriesDocs,
      },
      {
        new: true,
      }
    );

    return _.filter(starredRepositories, repo =>
      isTemplate != null ? repo.isTemplate === isTemplate : true
    );
  }

  @FieldResolver()
  async organizations(
    @Ctx() { authGitHub }: IContext,
    @Root() { githubId, login }: UserGitHub
  ) {
    const {
      user: {
        organizations: { nodes: organizations },
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
    >(
      gql`
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
      authGitHub,
      {
        login,
      }
    );

    const organizationsDocs = await Promise.all(
      organizations.map(org => {
        return OrganizationModel.findOneAndUpdate(
          {
            githubId: org.id,
          },
          org,
          {
            upsert: true,
            new: true,
          }
        );
      })
    );

    await UserGitHubModel.findOneAndUpdate(
      {
        githubId,
      },
      {
        organizations: organizationsDocs,
      }
    );

    return organizations;
  }
}
