import gql from "graphql-tag";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../../../utils";
import { APILevel } from "../../../consts";
import { IContext } from "../../../interfaces";
import { GitHubLanguage, GitHubRepository, GitRepository, RepositoryGitHub } from "../../entities";

@Resolver(() => RepositoryGitHub)
export class RepositoryGitHubResolver {
  constructor(
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>
  ) {}

  @Authorized(APILevel.ADVANCED)
  @Query(() => RepositoryGitHub, { nullable: true })
  async repository(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("name") name: string,
    @Arg("owner") owner: string
  ) {
    const {
      data: { repository },
    } = await GitHubAPI.query<
      {
        repository: GitHubRepository | null;
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
      `,
      variables: {
        name,
        owner,
      },
      context,
    });

    if (repository) this.GitRepoRepository.save(repository);

    return repository;
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

    this.GitRepoRepository.update(id, {
      starCount,
    });

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

    this.GitRepoRepository.update(id, {
      languages: repoLanguages,
    });

    return repoLanguages;
  }
}
