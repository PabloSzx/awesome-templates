import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Organization } from "../../entities";

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>
  ) {}

  @Query(() => [Organization])
  async organizations() {
    return await this.OrganizationRepository.find();
  }

  @FieldResolver()
  async members(@Root() { id }: Organization) {
    return (await this.OrganizationRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["members"],
      loadEagerRelations: false,
    })).members;
  }

  @FieldResolver()
  async repositories(@Root() { id }: Organization) {
    return (await this.OrganizationRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["repositories"],
      loadEagerRelations: false,
    })).repositories;
  }
}
