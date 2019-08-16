import _ from "lodash";
import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
import { GitRepository, Language, Organization, User } from "../entities";
import {
    IViewerDataQuery, IViewerReposQuery, IViewerReposQueryVariables, ViewerDataQuery,
    ViewerReposQuery
} from "../graphql/repository";
import { IContext } from "../interfaces";

@Resolver()
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
  @Query(_returns => [GitRepository])
  async userRepos(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { nullable: true }) isTemplate?: boolean
  ) {
    let GitRepos: Partial<GitRepository>[] = [];

    let cursor: string | undefined;

    let hasNextPage: boolean;
    do {
      const {
        data: {
          viewer: { repositories },
        },
      } = await GitHubAPI.query<IViewerReposQuery, IViewerReposQueryVariables>({
        query: ViewerReposQuery,
        context,
        variables: {
          after: cursor,
        },
      });

      GitRepos = _.concat(GitRepos, repositories.nodes);

      hasNextPage = repositories.pageInfo.hasNextPage;
      cursor = repositories.pageInfo.endCursor;
    } while (hasNextPage);

    if (isTemplate !== undefined) {
      return _.filter(GitRepos, repo => repo.isTemplate === isTemplate);
    }

    return GitRepos;
  }
}
