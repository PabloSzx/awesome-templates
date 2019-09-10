import { Arg, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { RepositoryOwner } from "../../entities";

@Resolver(() => RepositoryOwner)
export class RepositoryOwnerResolver {
  constructor(
    @InjectRepository(RepositoryOwner)
    private readonly RepositoryOwnerRepository: Repository<RepositoryOwner>
  ) {}

  @Query(() => [RepositoryOwner])
  async repositoryOwners() {
    return await this.RepositoryOwnerRepository.find();
  }

  @Query(() => RepositoryOwner, { nullable: true })
  async repositoryOwnerDB(@Arg("id") id: string) {
    return await this.RepositoryOwnerRepository.findOne(id);
  }

  @FieldResolver()
  async repositories(@Root() { id }: RepositoryOwner) {
    return (await this.RepositoryOwnerRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["repositories"],
      loadEagerRelations: false,
    })).repositories;
  }
}
