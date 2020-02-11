import gql from "graphql-tag";
import _ from "lodash";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";

import { APILevel } from "../../consts";
import { LanguageUpsertDataLoader } from "../../dataloaders/Language";
import {
  GitHubLanguage,
  GitHubRepository,
  GitRepositoryModel,
  LanguageModel,
  RepositoryGitHub,
} from "../../entities";
import { IContext } from "../../interfaces";
import { GitHubAPI } from "../../utils";

@Resolver(() => RepositoryGitHub)
export class RepositoryGitHubResolver {
  @Authorized(APILevel.ADVANCED)
  @Mutation(() => [RepositoryGitHub], { nullable: true })
  async searchRepository(
    @Ctx() { authGitHub }: IContext,
    @Arg("input") input: string
  ) {
    const {
      search: { nodes },
    } = await GitHubAPI.query<
      {
        search: {
          nodes: GitHubRepository[];
        };
      },
      {
        input: string;
      }
    >(
      gql`
        query search($input: String!) {
          search(type: REPOSITORY, query: $input, first: 20) {
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
      `,
      authGitHub,
      {
        input,
      }
    );

    const repositories = _.compact(
      nodes.map(
        ({ createdAt, updatedAt, ...repo }) =>
          createdAt &&
          updatedAt && {
            ...repo,
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
          }
      )
    );

    await Promise.all(
      repositories.map(repo => {
        if (repo.primaryLanguage) {
          return LanguageUpsertDataLoader.load(repo.primaryLanguage);
        }
      })
    );

    return repositories;
  }

  @FieldResolver()
  async starCount(
    @Ctx() { authGitHub }: IContext,
    @Root() { id, name, owner: { login: owner } }: GitHubRepository
  ): Promise<number> {
    try {
      const {
        repository: {
          stargazers: { totalCount: starCount },
        },
      } = await GitHubAPI.query<
        {
          repository: {
            id: string;
            stargazers: {
              totalCount: number;
            };
          };
        },
        {
          name: string;
          owner: string;
        }
      >(
        gql`
          query repository($name: String!, $owner: String!) {
            repository(name: $name, owner: $owner) {
              id
              stargazers {
                totalCount
              }
            }
          }
        `,
        authGitHub,
        {
          name,
          owner,
        }
      );

      await GitRepositoryModel.findOneAndUpdate(
        {
          githubId: id,
        },
        {
          starCount,
        },
        {
          new: true,
        }
      );

      return starCount;
    } catch (err) {
      console.error(174, err);
      return -1;
    }
  }

  @FieldResolver()
  async languages(
    @Ctx() { authGitHub }: IContext,
    @Root() { id, name, owner: { login: owner } }: GitHubRepository
  ) {
    const repoLanguages: GitHubLanguage[] = [];

    let after: string | undefined;
    let hasNextPage: boolean;

    do {
      try {
        const {
          repository: { languages },
        } = await GitHubAPI.query<
          {
            repository: {
              languages: {
                pageInfo: {
                  endCursor: string;
                  hasNextPage: boolean;
                };
                nodes: Array<GitHubLanguage>;
              } | null;
            };
          },
          {
            name: string;
            owner: string;
            after: string | undefined;
          }
        >(
          gql`
            query repository($name: String!, $owner: String!, $after: String) {
              repository(name: $name, owner: $owner) {
                id
                languages(
                  first: 1
                  orderBy: { field: SIZE, direction: DESC }
                  after: $after
                ) {
                  pageInfo {
                    endCursor
                    hasNextPage
                  }
                  nodes {
                    name
                    color
                  }
                }
              }
            }
          `,
          authGitHub,
          {
            name,
            owner,
            after,
          }
        );

        if (languages) {
          repoLanguages.push(...languages.nodes);
          after = languages.pageInfo.endCursor;
          hasNextPage = languages.pageInfo.hasNextPage;
        } else {
          hasNextPage = false;
        }
      } catch (err) {
        console.error(249, err);
        hasNextPage = false;
      }
    } while (hasNextPage);

    if (repoLanguages.length > 0)
      await Promise.all(
        repoLanguages.map(repoLang => {
          return LanguageUpsertDataLoader.load(repoLang);
        })
      );

    return repoLanguages;
  }
}
