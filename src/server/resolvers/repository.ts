import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { getGitHubAPIv3, GitHubAPI } from "../../utils";
import { GitRepository, Language, Organization, RepositoryGithubData, User } from "../entities";
import {
    IRepositoryDataQuery, IRepositoryDataQueryVariables, IViewerDataQuery, IViewerReposQuery,
    IViewerReposQueryVariables, RepositoryDataQuery, ViewerDataQuery, ViewerReposQuery
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
  @Query(_returns => User)
  async userData(@Ctx() { authGitHub: context }: IContext) {
    const { data } = await GitHubAPI.query<IViewerDataQuery>({
      query: ViewerDataQuery,
      context,
    });

    return data.viewer;
  }

  @Authorized()
  @Query(_returns => [RepositoryGithubData])
  async userRepos(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { nullable: true }) isTemplate?: boolean
  ) {
    let GitRepos: RepositoryGithubData[] = [];

    let cursor: string | undefined;

    let hasNextPage: boolean;
    do {
      const {
        data: {
          viewer: {
            repositories: { nodes, pageInfo },
          },
        },
      } = await GitHubAPI.query<IViewerReposQuery, IViewerReposQueryVariables>({
        query: ViewerReposQuery,
        context,
        variables: {
          after: cursor,
        },
      });

      GitRepos.push(
        ..._.compact(
          _.map(nodes, repo => {
            if (repo && repo.isTemplate !== isTemplate) {
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
      cursor = pageInfo.endCursor;
    } while (hasNextPage);

    return GitRepos;
  }

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

  @FieldResolver()
  async stargazers(@Root() repo: GitRepository) {
    const { data } = await getGitHubAPIv3<
      { login: string; id: string; url: string; avatar_url: string }[]
    >(`/repos/${repo.nameWithOwner}/stargazers`);

    return _.map(data, ({ login, id, url, avatar_url }) => ({
      login,
      id,
      url,
      avatarUrl: avatar_url,
    }));
  }

  @FieldResolver()
  async starCount(@Root() repo: GitRepository) {
    const {
      data: { length },
    } = await getGitHubAPIv3<
      { login: string; id: string; url: string; avatar_url: string }[]
    >(`/repos/${repo.nameWithOwner}/stargazers`);

    return length;
  }

  @FieldResolver()
  async languages(@Root() repo: GitRepository) {
    const { data } = await getGitHubAPIv3<Record<string, number>>(
      `/repos/${repo.nameWithOwner}/languages`
    );

    const sortedLanguages = _.map(
      _.sortBy(_.toPairs(data), v => v[1]).reverse(),
      v => ({
        name: v[0],
      })
    );

    return sortedLanguages;
  }
}
