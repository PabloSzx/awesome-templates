import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Framework } from "../entities";

@Resolver(_of => Framework)
export class FrameworkResolver {
  constructor(
    @InjectRepository(Framework)
    private readonly FrameworkRepository: Repository<Framework>
  ) {}

  @Query(_returns => [Framework])
  async frameworks() {
    return await this.FrameworkRepository.find();
  }

  @FieldResolver()
  async repositories(@Root() framework: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(framework.name, {
      relations: ["repositories"],
    })).repositories;
  }

  @FieldResolver()
  async languages(@Root() framework: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(framework.name, {
      relations: ["languages"],
    })).languages;
  }
}
