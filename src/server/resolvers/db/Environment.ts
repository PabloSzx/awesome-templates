import _ from "lodash";
import {
    Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { CreateEnvironmentInput, Environment, UpdateEnvironmentInput } from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => Environment)
export class EnvironmentResolver {
  constructor(
    @InjectRepository(Environment)
    private readonly EnvironmentRepository: Repository<Environment>
  ) {}

  @Query(() => [Environment])
  async environments() {
    return await this.EnvironmentRepository.find();
  }

  @Query(() => Environment, { nullable: true })
  async environment(@Arg("id") id: string) {
    return await this.EnvironmentRepository.findOne(id);
  }

  @Authorized()
  @Mutation(() => Environment)
  async createEnvironment(
    @Args()
    { name, url, logoUrl, description }: CreateEnvironmentInput,
    @Ctx() { user: creator }: IContext
  ) {
    const newEnvironment = this.EnvironmentRepository.create({
      name,
      url,
      logoUrl,
      description,
      creator,
    });

    return await this.EnvironmentRepository.save(newEnvironment);
  }

  @Authorized()
  @Mutation(() => Environment)
  async updateEnvironment(@Args()
  {
    id,
    name,
    url,
    logoUrl,
    description,
  }: UpdateEnvironmentInput) {
    const partialEnvirontment: Partial<Environment> = {
      name,
      url,
      logoUrl,
      description,
    };

    const [environment] = await Promise.all([
      this.EnvironmentRepository.findOneOrFail(id),
      ,
    ]);

    _.assign(environment, _.omitBy(partialEnvirontment, _.isUndefined));

    return await this.EnvironmentRepository.save(environment);
  }

  @FieldResolver()
  async templates(@Root() { name }: Environment) {
    return (await this.EnvironmentRepository.findOneOrFail(name, {
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }
}
