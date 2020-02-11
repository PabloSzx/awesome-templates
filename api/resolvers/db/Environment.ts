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

import { isDocument } from "@typegoose/typegoose";

import { NOT_AUTHORIZED } from "../../consts";
import {
  CreateEnvironmentInput,
  Environment,
  EnvironmentModel,
  UpdateEnvironmentInput,
} from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => Environment)
export class EnvironmentResolver {
  @Query(() => [Environment])
  async environments() {
    return await EnvironmentModel.find();
  }

  @Query(() => Environment, { nullable: true })
  async environment(@Arg("id") id: string) {
    return await EnvironmentModel.findById(id);
  }

  @Authorized()
  @Mutation(() => Environment)
  async createEnvironment(
    @Args()
    { name, url, logoUrl, description }: CreateEnvironmentInput,
    @Ctx() { user: creator }: IContext
  ) {
    const newEnvironment = await EnvironmentModel.findOneAndUpdate(
      { name },
      {
        url,
        logoUrl,
        description,
        creator,
      },
      { upsert: true, new: true }
    );

    return newEnvironment;
  }

  @Authorized()
  @Mutation(() => Environment)
  async updateEnvironment(
    @Args()
    { _id, ...rest }: UpdateEnvironmentInput,
    @Ctx() { user }: IContext
  ) {
    const [environment] = await Promise.all([
      EnvironmentModel.findById(_id).populate("creator"),
      ,
    ]);

    if (
      environment &&
      (user.admin ||
        (environment.creator &&
          isDocument(environment?.creator) &&
          environment.creator.id) === user.id)
    ) {
      _.assign(environment, _.omitBy(rest, _.isUndefined));

      return await environment.save();
    }

    throw new Error(NOT_AUTHORIZED);
  }

  @Authorized()
  @Mutation(() => String)
  async removeEnvironment(@Arg("id") id: string, @Ctx() { user }: IContext) {
    const env = await EnvironmentModel.findById(id).populate("creator");
    if (
      user.admin ||
      (env?.creator && isDocument(env.creator) && env.creator.id === user.id)
    ) {
      await EnvironmentModel.findByIdAndRemove(id);
      return id;
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @FieldResolver()
  async templates(@Root() { _id }: Environment) {
    return (
      (await EnvironmentModel.findById(_id).populate("templates"))?.templates ??
      []
    );
  }

  @FieldResolver()
  async creator(@Root() { _id }: Environment) {
    return (await EnvironmentModel.findById(_id).populate("creator"))?.creator;
  }
}
