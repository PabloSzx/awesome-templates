import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { IContext } from "../../../interfaces";
import {
    CreateTemplateInput, Framework, GitRepository, Language, Library, Template, UpdateTemplateInput
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

  @Query(() => Template, { nullable: true })
  async template(@Arg("name") name: string, @Arg("owner") owner: string) {
    const templates = await this.TemplateRepository.find({
      where: `"Template"."name" ILIKE '${name}'`,
    });

    owner = _.toLower(owner);

    return _.find(
      templates,
      ({
        owner: {
          data: { login },
        },
      }) => _.toLower(login) === owner
    );
  }

  @Authorized()
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
    const newTemplate = this.TemplateRepository.create({
      name,
      owner,
    });

    await Promise.all([
      (async () => {
        newTemplate.repository = await this.GitRepoRepository.findOneOrFail(
          repositoryId,
          {
            relations: !languages ? ["languages"] : undefined,
          }
        );
        if (!primaryLanguage)
          newTemplate.primaryLanguage = newTemplate.repository.primaryLanguage;

        if (!languages)
          newTemplate.languages = newTemplate.repository.languages;
      })(),
      (async () => {
        if (primaryLanguage)
          newTemplate.primaryLanguage = await this.LanguageRepository.findOneOrFail(
            primaryLanguage
          );
      })(),
      (async () => {
        if (languages)
          newTemplate.languages = await this.LanguageRepository.findByIds(
            languages
          );
      })(),
      (async () => {
        if (frameworks)
          newTemplate.frameworks = await this.FrameworkRepository.findByIds(
            frameworks
          );
      })(),
      (async () => {
        if (libraries)
          newTemplate.libraries = await this.LibraryRepository.findByIds(
            libraries
          );
      })(),
    ]);

    return await this.TemplateRepository.save(newTemplate);
  }

  @Authorized()
  @Mutation(() => Template)
  async updateTemplate(@Arg("data")
  {
    templateId,
    name,
    repositoryId,
    primaryLanguage,
    languages,
    frameworks,
    libraries,
  }: UpdateTemplateInput) {
    const partialTemplate: Partial<Template> = {
      name,
    };
    let [template] = await Promise.all([
      this.TemplateRepository.findOneOrFail(templateId),
      (async () => {
        if (repositoryId)
          partialTemplate.repository = await this.GitRepoRepository.findOneOrFail(
            repositoryId
          );
      })(),
      (async () => {
        if (primaryLanguage)
          partialTemplate.primaryLanguage = await this.LanguageRepository.findOneOrFail(
            primaryLanguage
          );
      })(),
      (async () => {
        if (languages)
          partialTemplate.languages = await this.LanguageRepository.findByIds(
            languages
          );
      })(),
      (async () => {
        if (frameworks)
          partialTemplate.frameworks = await this.FrameworkRepository.findByIds(
            frameworks
          );
      })(),
      (async () => {
        if (libraries)
          partialTemplate.libraries = await this.LibraryRepository.findByIds(
            libraries
          );
      })(),
    ]);

    _.assign(template, _.omitBy(partialTemplate, _.isUndefined));

    return await this.TemplateRepository.save(template);
  }

  @FieldResolver()
  async upvotes(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["upvotes"],
      loadEagerRelations: false,
    })).upvotes;
  }

  @FieldResolver()
  async upvotesCount(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["upvotes"],
      loadEagerRelations: false,
    })).upvotes.length;
  }

  @FieldResolver()
  async languages(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["languages"],
      loadEagerRelations: false,
    })).languages;
  }

  @FieldResolver()
  async libraries(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["libraries"],
      loadEagerRelations: false,
    })).libraries;
  }

  @FieldResolver()
  async frameworks(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["frameworks"],
      loadEagerRelations: false,
    })).frameworks;
  }

  @FieldResolver()
  async environments(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["environments"],
      loadEagerRelations: false,
    })).environments;
  }
}
