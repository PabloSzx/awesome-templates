import _ from "lodash";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { NOT_AUTHORIZED } from "../../consts";
import {
  CreateFrameworkInput,
  Framework,
  Language,
  UpdateFrameworkInput,
} from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => Framework)
export class FrameworkResolver {
  constructor(
    @InjectRepository(Framework)
    private readonly FrameworkRepository: Repository<Framework>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Query(() => [Framework])
  async frameworks() {
    return await this.FrameworkRepository.find();
  }

  @Query(() => Framework, { nullable: true })
  async framework(@Arg("id") id: string) {
    return await this.FrameworkRepository.findOne(id);
  }

  @Authorized()
  @Mutation(() => Framework)
  async createFramework(
    @Args()
    { name, url, logoUrl, description, languages }: CreateFrameworkInput,
    @Ctx() { user: creator }: IContext
  ) {
    const newFramework = this.FrameworkRepository.create({
      name,
      url,
      logoUrl,
      description,
      creator,
      languages: await this.LanguageRepository.findByIds(languages),
    });

    return await this.FrameworkRepository.save(newFramework);
  }

  @Authorized()
  @Mutation(() => Framework)
  async updateFramework(
    @Args()
    { id, name, url, logoUrl, description, languages }: UpdateFrameworkInput,
    @Ctx() { user }: IContext
  ) {
    const partialFramework: Partial<Framework> = {
      name,
      url,
      logoUrl,
      description,
    };

    const [framework] = await Promise.all([
      this.FrameworkRepository.findOneOrFail(id, {
        relations: ["creator"],
      }),
      (async () => {
        partialFramework.languages = await this.LanguageRepository.findByIds(
          languages
        );
      })(),
    ]);

    if (user.admin || framework.creator.id === user.id) {
      _.assign(framework, _.omitBy(partialFramework, _.isUndefined));

      return await this.FrameworkRepository.save(framework);
    }

    throw new Error(NOT_AUTHORIZED);
  }

  @Authorized()
  @Mutation(() => String)
  async removeFramework(@Arg("id") id: string, @Ctx() { user }: IContext) {
    const framework = await this.FrameworkRepository.findOneOrFail(id, {
      select: ["id", "creator"],
      relations: ["creator"],
      loadEagerRelations: false,
    });
    if (user.admin || framework.creator.id === user.id) {
      await this.FrameworkRepository.remove(framework);
      return id;
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @FieldResolver()
  async languages(@Root() { id }: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["languages"],
      loadEagerRelations: false,
    })).languages;
  }

  @FieldResolver()
  async creator(@Root() { id }: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(id, {
      select: ["id", "creator"],
      relations: ["creator"],
      loadEagerRelations: false,
    })).creator;
  }

  @FieldResolver()
  async templates(@Root() { id }: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(id, {
      select: ["id", "creator"],
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }
}
