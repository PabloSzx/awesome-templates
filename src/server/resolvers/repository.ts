import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
import { APP_INSTALLED } from "../consts";
import { GitRepository, Language, Organization, User, UserGitHubData } from "../entities";
import {
    IRepositoryDataQuery, IRepositoryDataQueryVariables, IRepositoryLanguagesQuery,
    IRepositoryLanguagesQueryVariables, IRepositoryStarCountQuery,
    IRepositoryStarCountQueryVariables, IRepositoryStarsQuery, IRepositoryStarsQueryVariables,
    RepositoryDataQuery, RepositoryLanguagesQuery, RepositoryStarCountQuery, RepositoryStarsQuery
} from "../graphql/repository";
import { IContext } from "../interfaces";

@Resolver(_of => GitRepository)
export class RepositoryResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>,
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Authorized()
  @Query(_returns => GitRepository)
  async repositoryData(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("name") name: string,
    @Arg("owner") owner: string
  ) {
    const {
      data: { repository },
    } = await GitHubAPI.query<
      IRepositoryDataQuery,
      IRepositoryDataQueryVariables
    >({
      query: RepositoryDataQuery,
      context,
      variables: {
        name,
        owner,
      },
    });

    return repository;
  }

  @Authorized(APP_INSTALLED)
  @FieldResolver()
  async stargazers(
    @Root() repo: GitRepository,
    @Ctx() { authGitHub: context }: IContext
  ) {
    const stargazers: UserGitHubData[] = [];

    let cursor: string | undefined;
    let hasNextPage: boolean;
    do {
      const {
        data: {
          repository: {
            stargazers: { pageInfo, nodes },
          },
        },
      } = await GitHubAPI.query<
        IRepositoryStarsQuery,
        IRepositoryStarsQueryVariables
      >({
        query: RepositoryStarsQuery,
        variables: {
          name: repo.name,
          owner: repo.owner.login,
          after: cursor,
        },
        context,
      });

      stargazers.push(...nodes);

      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    } while (hasNextPage);

    return stargazers;
  }

  @Authorized(APP_INSTALLED)
  @FieldResolver()
  async starCount(
    @Root() repo: GitRepository,
    @Ctx() { authGitHub: context }: IContext
  ) {
    const {
      data: {
        repository: {
          stargazers: { totalCount },
        },
      },
    } = await GitHubAPI.query<
      IRepositoryStarCountQuery,
      IRepositoryStarCountQueryVariables
    >({
      query: RepositoryStarCountQuery,
      variables: {
        name: repo.name,
        owner: repo.owner.login,
      },
      context,
    });

    return totalCount;
  }

  @Authorized(APP_INSTALLED)
  @FieldResolver()
  async languages(
    @Root() repo: GitRepository,
    @Ctx() { authGitHub: context }: IContext
  ) {
    const sortedLanguages: Language[] = [];

    let cursor: string | undefined;
    let hasNextPage: boolean;
    do {
      const {
        data: {
          repository: { languages },
        },
      } = await GitHubAPI.query<
        IRepositoryLanguagesQuery,
        IRepositoryLanguagesQueryVariables
      >({
        query: RepositoryLanguagesQuery,
        variables: {
          name: repo.name,
          owner: repo.owner.login,
          after: cursor,
        },
        context,
      });

      if (languages) {
        sortedLanguages.push(...languages.nodes);

        cursor = languages.pageInfo.endCursor;
        hasNextPage = languages.pageInfo.hasNextPage;
      } else {
        hasNextPage = false;
      }
    } while (hasNextPage);

    return sortedLanguages;
  }
}
