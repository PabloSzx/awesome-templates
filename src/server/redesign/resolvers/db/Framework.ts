import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Framework } from "../../entities";

@Resolver(() => Framework)
export class FrameworkResolver {
  constructor(
    @InjectRepository(Framework)
    private readonly FrameworkRepository: Repository<Framework>
  ) {}

  @Query(() => [Framework])
  async frameworks() {
    return await this.FrameworkRepository.find();
  }

  @FieldResolver()
  async languages(@Root() { name }: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(name, {
      relations: ["languages"],
    })).languages;
  }

  @FieldResolver()
  async templates(@Root() { name }: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(name, {
      relations: ["templates"],
    })).templates;
  }
}
