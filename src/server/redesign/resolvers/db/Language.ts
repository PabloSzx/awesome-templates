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
      relations: ["repositories"],
    })).repositories;
  }
  @FieldResolver()
  async primaryRepositories(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      relations: ["primaryRepositories"],
    })).primaryRepositories;
  }
  @FieldResolver()
  async templates(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      relations: ["templates"],
    })).templates;
  }
  @FieldResolver()
  async primaryTemplates(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      relations: ["primaryTemplates"],
    })).primaryTemplates;
  }
  @FieldResolver()
  async frameworks(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      relations: ["frameworks"],
    })).frameworks;
  }
  @FieldResolver()
  async libraries(@Root() { name }: Language) {
    return (await this.LanguageRepository.findOneOrFail(name, {
      relations: ["libraries"],
    })).libraries;
  }
}
