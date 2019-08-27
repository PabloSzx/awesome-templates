import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Library } from "../../entities";

@Resolver(() => Library)
export class LibraryResolver {
  constructor(
    @InjectRepository(Library)
    private readonly LibraryRepository: Repository<Library>
  ) {}

  @Query(() => [Library])
  async libraries() {
    return await this.LibraryRepository.find();
  }

  @FieldResolver()
  async templates(@Root() { name }: Library) {
    return (await this.LibraryRepository.findOneOrFail(name, {
      relations: ["templates"],
    })).templates;
  }
}
