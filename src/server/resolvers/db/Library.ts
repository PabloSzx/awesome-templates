import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

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

  @Authorized()
  @Mutation(() => Library)
  async createLibrary(
    @Arg("data")
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

    return await this.LibraryRepository.save(newLibrary);
  }

  @Authorized()
  @Mutation(() => Library)
  async updateLibrary(@Arg("data")
  {
    name,
    newName,
    url,
    logoUrl,
    description,
    language,
  }: UpdateLibraryInput) {
    const partialLibrary: Partial<Library> = {
      name: newName,
      url,
      logoUrl,
      description,
    };

    let [library] = await Promise.all([
      this.LibraryRepository.findOneOrFail(name),
      (async () => {
        if (language) {
          partialLibrary.language = await this.LanguageRepository.findOneOrFail(
            language
          );
        }
      })(),
    ]);

    _.assign(library, _.omitBy(partialLibrary, _.isUndefined));

    return await this.LibraryRepository.save(library);
  }

  @FieldResolver()
  async templates(@Root() { name }: Library) {
    return (await this.LibraryRepository.findOneOrFail(name, {
      select: ["name"],
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }
}
