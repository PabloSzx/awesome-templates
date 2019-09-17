import _ from "lodash";
import {
    Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { NOT_AUTHORIZED } from "../../../consts";
import { CreateLibraryInput, Language, Library, UpdateLibraryInput } from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => Library)
export class LibraryResolver {
  constructor(
    @InjectRepository(Library)
    private readonly LibraryRepository: Repository<Library>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Query(() => [Library])
  async libraries() {
    return await this.LibraryRepository.find();
  }

  @Query(() => Library, { nullable: true })
  async library(@Arg("id") id: string) {
    return await this.LibraryRepository.findOne(id);
  }

  @Authorized()
  @Mutation(() => [Library])
  async createLibrary(
    @Args()
    { name, url, logoUrl, description, language }: CreateLibraryInput,
    @Ctx() { user: creator }: IContext
  ) {
    const newLibrary = this.LibraryRepository.create({
      name,
      url,
      logoUrl,
      description,
      creator,
      language: await this.LanguageRepository.findOneOrFail(language),
    });

    await this.LibraryRepository.save(newLibrary);

    return await this.LibraryRepository.find();
  }

  @Authorized()
  @Mutation(() => Library)
  async updateLibrary(
    @Args()
    { id, name, url, logoUrl, description, language }: UpdateLibraryInput,
    @Ctx() { user }: IContext
  ) {
    const partialLibrary: Partial<Library> = {
      name,
      url,
      logoUrl,
      description,
    };

    let [library] = await Promise.all([
      this.LibraryRepository.findOneOrFail(id, { relations: ["creator"] }),
      (async () => {
        if (language) {
          partialLibrary.language = await this.LanguageRepository.findOneOrFail(
            language
          );
        }
      })(),
    ]);
    if (user.admin || library.creator.id === user.id) {
      _.assign(library, _.omitBy(partialLibrary, _.isUndefined));

      return await this.LibraryRepository.save(library);
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @Authorized()
  @Mutation(() => String)
  async removeLibrary(@Arg("id") id: string, @Ctx() { user }: IContext) {
    const library = await this.LibraryRepository.findOneOrFail(id, {
      select: ["id", "creator"],
      relations: ["creator"],
      loadEagerRelations: false,
    });

    if (user.admin || library.creator.id === user.id) {
      await this.LibraryRepository.remove(library);
      return id;
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @FieldResolver()
  async templates(@Root() { id }: Library) {
    return (await this.LibraryRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }

  @FieldResolver()
  async creator(@Root() { id }: Library) {
    return (await this.LibraryRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["creator"],
      loadEagerRelations: false,
    })).creator;
  }
}
