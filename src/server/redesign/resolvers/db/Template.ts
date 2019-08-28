import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { IContext } from "../../../interfaces";
import {
    CreateTemplateInput, Framework, GitRepository, Language, Library, Template
} from "../../entities";

@Resolver(() => Template)
export class TemplateResolver {
  constructor(
    @InjectRepository(Template)
    private readonly TemplateRepository: Repository<Template>,
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>,
    @InjectRepository(Framework)
    private readonly FrameworkRepository: Repository<Framework>,
    @InjectRepository(Library)
    private readonly LibraryRepository: Repository<Library>
  ) {}

  @Query(() => [Template])
  async templates() {
    return await this.TemplateRepository.find();
  }

  @Mutation(() => Template)
  async createTemplate(
    @Arg("data")
    {
      name,
      repositoryId,
      primaryLanguage,
      languages,
      frameworks,
      libraries,
    }: CreateTemplateInput,
    @Ctx() { user: owner }: IContext
  ) {
    const repository = await this.GitRepoRepository.findOneOrFail(repositoryId);

    const newTemplate = this.TemplateRepository.create({
      name,
      repository,
      owner,
    });

    if (primaryLanguage) {
      newTemplate.primaryLanguage = await this.LanguageRepository.findOneOrFail(
        primaryLanguage
      );
    }
    if (languages) {
      newTemplate.languages = await this.LanguageRepository.findByIds(
        languages
      );
    }
    if (frameworks) {
      newTemplate.frameworks = await this.FrameworkRepository.findByIds(
        frameworks
      );
    }
    if (libraries) {
      newTemplate.libraries = await this.LibraryRepository.findByIds(libraries);
    }

    await this.TemplateRepository.save(newTemplate);
    return newTemplate;
  }

  @FieldResolver()
  async upvotes(@Root() { name }: Template) {
    return (await this.TemplateRepository.findOneOrFail(name, {
      relations: ["upvotes"],
    })).upvotes;
  }

  @FieldResolver()
  async upvotesCount(@Root() { name }: Template) {
    return (await this.TemplateRepository.findOneOrFail(name, {
      relations: ["upvotes"],
    })).upvotes.length;
  }

  @FieldResolver()
  async languages(@Root() { name }: Template) {
    return (await this.TemplateRepository.findOneOrFail(name, {
      relations: ["languages"],
    })).languages;
  }

  @FieldResolver()
  async libraries(@Root() { name }: Template) {
    return (await this.TemplateRepository.findOneOrFail(name, {
      relations: ["libraries"],
    })).libraries;
  }

  @FieldResolver()
  async frameworks(@Root() { name }: Template) {
    return (await this.TemplateRepository.findOneOrFail(name, {
      relations: ["frameworks"],
    })).frameworks;
  }
}
