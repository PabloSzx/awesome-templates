import _ from "lodash";
import {
    Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { CreateFrameworkInput, Framework, Language, UpdateFrameworkInput } from "../../entities";
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
    });
    if (languages) {
      newFramework.languages = await this.LanguageRepository.findByIds(
        languages
      );
    }

    return await this.FrameworkRepository.save(newFramework);
  }

  @Authorized()
  @Mutation(() => Framework)
  async updateFramework(@Args()
  {
    id,
    name,
    url,
    logoUrl,
    description,
    languages,
  }: UpdateFrameworkInput) {
    const partialFramework: Partial<Framework> = {
      name,
      url,
      logoUrl,
      description,
    };

    const [framework] = await Promise.all([
      this.FrameworkRepository.findOneOrFail(id),
      (async () => {
        if (languages) {
          partialFramework.languages = await this.LanguageRepository.findByIds(
            languages
          );
        }
      })(),
    ]);

    _.assign(framework, _.omitBy(partialFramework, _.isUndefined));

    return await this.FrameworkRepository.save(framework);
  }

  @FieldResolver()
  async languages(@Root() { name }: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(name, {
      select: ["name"],
      relations: ["languages"],
      loadEagerRelations: false,
    })).languages;
  }

  @FieldResolver()
  async templates(@Root() { name }: Framework) {
    return (await this.FrameworkRepository.findOneOrFail(name, {
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }
}
