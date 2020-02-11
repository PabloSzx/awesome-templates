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
  CreateFrameworkInput,
  Framework,
  FrameworkModel,
  UpdateFrameworkInput,
} from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => Framework)
export class FrameworkResolver {
  @Query(() => [Framework])
  async frameworks() {
    return await FrameworkModel.find();
  }

  @Query(() => Framework, { nullable: true })
  async framework(@Arg("id") id: string) {
    return await FrameworkModel.findById(id);
  }

  @Authorized()
  @Mutation(() => Framework)
  async createFramework(
    @Args()
    { name, url, logoUrl, description, languages }: CreateFrameworkInput,
    @Ctx() { user: creator }: IContext
  ) {
    const newFramework = await FrameworkModel.findOneAndUpdate(
      { name },
      {
        url,
        logoUrl,
        description,
        creator,
        languages,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return newFramework;
  }

  @Authorized()
  @Mutation(() => Framework)
  async updateFramework(
    @Args()
    { _id, ...rest }: UpdateFrameworkInput,
    @Ctx() { user }: IContext
  ) {
    const [framework] = await Promise.all([
      FrameworkModel.findById(_id).populate("creator"),
    ]);

    if (
      framework &&
      (user.admin ||
        (framework.creator &&
          isDocument(framework.creator) &&
          framework.creator.id === user.id))
    ) {
      _.assign(framework, _.omitBy(rest, _.isUndefined));

      return await framework.save();
    }

    throw new Error(NOT_AUTHORIZED);
  }

  @Authorized()
  @Mutation(() => String)
  async removeFramework(@Arg("id") id: string, @Ctx() { user }: IContext) {
    const framework = await FrameworkModel.findById(id).populate("creator");
    if (
      framework &&
      (user.admin ||
        (isDocument(framework.creator) && framework.creator.id === user.id))
    ) {
      await FrameworkModel.findByIdAndRemove(id);
      return id;
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @FieldResolver()
  async languages(@Root() { _id }: Framework) {
    return (
      (await FrameworkModel.findById(_id).populate("languages"))?.languages ??
      []
    );
  }

  @FieldResolver()
  async creator(@Root() { _id }: Framework) {
    return (await FrameworkModel.findById(_id).populate("creator"))?.creator;
  }

  @FieldResolver()
  async templates(@Root() { _id }: Framework) {
    return (
      (await FrameworkModel.findById(_id).populate("templates"))?.templates ??
      []
    );
  }
}
