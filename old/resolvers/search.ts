import _ from "lodash";
import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
import { APILevel } from "../consts";
import { GitRepository, Language, Organization, User } from "../entities";
import {
    ISearchRepositoryQuery, ISearchRepositoryQueryVariables, SearchRepositoryQuery
} from "../graphql/search";
import { IContext } from "../interfaces";

@Resolver()
export class SearchResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>,
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Authorized(APILevel.ADVANCED)
  @Query(_returns => [GitRepository])
  async searchRepositoryAPI(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("input") input: string,
    @Arg("isTemplate", { nullable: true }) isTemplate?: boolean
  ) {
    let {
      data: {
        search: { nodes },
      },
    } = await GitHubAPI.query<
      ISearchRepositoryQuery,
      ISearchRepositoryQueryVariables
    >({
      query: SearchRepositoryQuery,
      variables: {
        input,
      },
      context,
    });

    nodes = _.compact(
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
    );

    await this.GitRepoRepository.save(nodes);

    return nodes;
  }
}
