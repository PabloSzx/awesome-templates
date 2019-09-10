import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { IContext } from "../../../interfaces";
import { CreateEnvironmentInput, Environment, UpdateEnvironmentInput } from "../../entities";

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

  @Authorized()
  @Mutation(() => Environment)
  async createEnvironment(
    @Arg("data")
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
  async updateEnvironment(@Arg("data")
  {
    name,
    newName,
    url,
    logoUrl,
    description,
  }: UpdateEnvironmentInput) {
    const partialEnvirontment: Partial<Environment> = {
      name: newName,
      url,
      logoUrl,
      description,
    };

    const [environment] = await Promise.all([
      this.EnvironmentRepository.findOneOrFail(name),
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
