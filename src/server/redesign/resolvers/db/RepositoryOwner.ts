import { Arg, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Organization, RepositoryOwnerUnion, UserGitHub } from "../../entities";

@Resolver()
export class RepositoryOwnerResolver {
  constructor(
    @InjectRepository(UserGitHub)
    private readonly UserGitHubRepository: Repository<UserGitHub>,
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>
  ) {}

  @Query(() => RepositoryOwnerUnion, { nullable: true })
  async repositoryOwnerDB(@Arg("id") id: string) {
    const [user, org] = await Promise.all([
      this.UserGitHubRepository.findOne(id),
      this.OrganizationRepository.findOne(id),
    ]);

    if (user) return user;

    if (org) return org;

    return null;
  }
}
