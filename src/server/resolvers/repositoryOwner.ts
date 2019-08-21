import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
import { APILevel } from "../consts";
import { GitRepository, Language, Organization, RepositoryOwner, User } from "../entities";
import {
    IRepositoryOwnerQueryData, IRepositoryOwnerQueryDataVariables, RepositoryOwnerQueryData
} from "../graphql/repositoryOwner";
import { IContext } from "../interfaces";

@Resolver(_of => RepositoryOwner)
export class RepositoryOwnerResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>,
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>,
    @InjectRepository(RepositoryOwner)
    private readonly RepositoryOwnerRepo: Repository<RepositoryOwner>
  ) {}

  @Authorized(APILevel.ADVANCED)
  @Query(_returns => RepositoryOwner)
  async repositoryOwner(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("id") id: string
  ) {
    const [{ data }, repoOwner] = await Promise.all([
      GitHubAPI.query<
        IRepositoryOwnerQueryData,
        IRepositoryOwnerQueryDataVariables
      >({
        query: RepositoryOwnerQueryData,
        variables: {
          id,
        },
        context,
      }),
      this.RepositoryOwnerRepo.findOne(id),
    ]);

    if (repoOwner && data && data.node) {
      const { node } = data;

      switch (node.__typename) {
        case "User":
          repoOwner.user = node;
          break;
        case "Organization":
          repoOwner.organization = node;
          break;
        default:
      }

      this.RepositoryOwnerRepo.save(repoOwner);
    }

    return repoOwner;
  }
}
