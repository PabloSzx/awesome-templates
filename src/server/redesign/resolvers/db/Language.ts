import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Language } from "../../entities";

@Resolver(() => Language)
export class LanguageResolver {
  constructor(
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Query(() => [Language])
  async languages() {
    return await this.LanguageRepository.find();
  }

  @FieldResolver()
  async repositories(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      select: ["name"],
      relations: ["repositories"],
      loadEagerRelations: false,
    })).repositories;
  }
  @FieldResolver()
  async primaryRepositories(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      select: ["name"],
      relations: ["primaryRepositories"],
      loadEagerRelations: false,
    })).primaryRepositories;
  }
  @FieldResolver()
  async templates(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      select: ["name"],
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }
  @FieldResolver()
  async primaryTemplates(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      select: ["name"],
      relations: ["primaryTemplates"],
      loadEagerRelations: false,
    })).primaryTemplates;
  }
  @FieldResolver()
  async frameworks(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      select: ["name"],
      relations: ["frameworks"],
      loadEagerRelations: false,
    })).frameworks;
  }
  @FieldResolver()
  async libraries(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      select: ["name"],
      relations: ["libraries"],
      loadEagerRelations: false,
    })).libraries;
  }
}
