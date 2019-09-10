import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Library } from "../entities";

@Resolver(_of => Library)
export class LibraryResolver {
  constructor(
    @InjectRepository(Library)
    private readonly LibraryRepository: Repository<Library>
  ) {}

  @Query(_returns => [Library])
  async libraries() {
    return await this.LibraryRepository.find();
  }

  @FieldResolver()
  async repositories(@Root() library: Library) {
    return (await this.LibraryRepository.findOneOrFail(library.name, {
      relations: ["repositories"],
    })).repositories;
  }
}
