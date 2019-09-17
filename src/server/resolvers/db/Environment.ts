import _ from "lodash";
import {
    Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root
} from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { NOT_AUTHORIZED } from "../../../consts";
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
  async updateEnvironment(
    @Args()
    { id, name, url, logoUrl, description }: UpdateEnvironmentInput,
    @Ctx() { user }: IContext
  ) {
    const partialEnvirontment: Partial<Environment> = {
      name,
      url,
      logoUrl,
      description,
    };

    const [environment] = await Promise.all([
      this.EnvironmentRepository.findOneOrFail(id, {
        relations: ["creator"],
      }),
      ,
    ]);

    if (user.admin || environment.creator.id === user.id) {
      _.assign(environment, _.omitBy(partialEnvirontment, _.isUndefined));

      return await this.EnvironmentRepository.save(environment);
    }

    throw new Error(NOT_AUTHORIZED);
  }

  @Authorized()
  @Mutation(() => String)
  async removeEnvironment(@Arg("id") id: string, @Ctx() { user }: IContext) {
    const env = await this.EnvironmentRepository.findOneOrFail(id, {
      select: ["id", "creator"],
      relations: ["creator"],
      loadEagerRelations: false,
    });
    if (user.admin || env.creator.id === user.id) {
      await this.EnvironmentRepository.remove(env);
      return id;
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @FieldResolver()
  async templates(@Root() { id }: Environment) {
    return (await this.EnvironmentRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }

  @FieldResolver()
  async creator(@Root() { id }: Environment) {
    return (await this.EnvironmentRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["creator"],
      loadEagerRelations: false,
    })).creator;
  }
}
