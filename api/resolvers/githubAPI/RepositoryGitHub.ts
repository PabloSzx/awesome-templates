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
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { APILevel } from "../../consts";
import { GitHubAPI } from "../../utils";
import {
  GitHubLanguage,
  GitHubRepository,
  GitRepository,
  Language,
  RepositoryGitHub,
} from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => RepositoryGitHub)
export class RepositoryGitHubResolver {
  constructor(
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Authorized(APILevel.ADVANCED)
  @Mutation(() => [RepositoryGitHub], { nullable: true })
  async searchRepository(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("input") input: string
  ) {
    const {
      data: {
        search: { nodes },
      },
    } = await GitHubAPI.query<
      {
        search: {
          nodes: GitHubRepository[];
        };
      },
      {
        input: string;
      }
    >({
      query: gql`
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
      variables: {
        input,
      },
      context,
    });

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

    async () => {
      try {
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

        await this.GitRepoRepository.save(repositories);
      } catch (err) {
        console.error(1, err);
      }
    };

    return repositories;
  }

  @FieldResolver()
  async starCount(
    @Ctx() { authGitHub: context }: IContext,
    @Root() { id, name, owner: { login: owner } }: GitHubRepository
  ): Promise<number> {
    const {
      data: {
        repository: {
          stargazers: { totalCount: starCount },
        },
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
    >({
      query: gql`
        query repository($name: String!, $owner: String!) {
          repository(name: $name, owner: $owner) {
            id
            stargazers {
              totalCount
            }
          }
        }
      `,
      variables: {
        name,
        owner,
      },
      context,
    });

    this.GitRepoRepository.createQueryBuilder()
      .update()
      .set({
        starCount,
      })
      .where("id = :id", { id })
      .execute()
      .catch(err => console.error(err));

    return starCount;
  }

  @FieldResolver()
  async languages(
    @Ctx() { authGitHub: context }: IContext,
    @Root() { id, name, owner: { login: owner } }: GitHubRepository
  ) {
    const repoLanguages: GitHubLanguage[] = [];

    let after: string | undefined;
    let hasNextPage: boolean;

    do {
      const {
        data: {
          repository: { languages },
        },
      } = await GitHubAPI.query<
        {
          repository: {
            languages:
              | ({
                  pageInfo: {
                    endCursor: string;
                    hasNextPage: boolean;
                  };
                  nodes: Array<GitHubLanguage>;
                })
              | null;
          };
        },
        {
          name: string;
          owner: string;
          after: string | undefined;
        }
      >({
        query: gql`
          query repository($name: String!, $owner: String!, $after: String) {
            repository(name: $name, owner: $owner) {
              id
              languages(
                first: 20
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
        variables: {
          name,
          owner,
          after,
        },
        context,
      });

      if (languages) {
        repoLanguages.push(...languages.nodes);
        after = languages.pageInfo.endCursor;
        hasNextPage = languages.pageInfo.hasNextPage;
      } else {
        hasNextPage = false;
      }
    } while (hasNextPage);

    if (repoLanguages.length > 0)
      (async () => {
        try {
          await this.LanguageRepository.createQueryBuilder()
            .insert()
            .orIgnore()
            .values(repoLanguages)
            .execute();

          await this.GitRepoRepository.save({ id, languages: repoLanguages });
        } catch (err) {
          console.error(2, err);
        }
      })();

    return repoLanguages;
  }
}
