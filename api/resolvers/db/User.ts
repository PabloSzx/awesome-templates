import { ObjectId } from "mongodb";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { isDocument } from "@typegoose/typegoose";

import { ADMIN } from "../../consts";
import { TemplateModel, User, UserModel } from "../../entities";
import { IContext } from "../../interfaces";
import { ObjectIdScalar } from "../../utils/ObjectIdScalar";

@Resolver(() => User)
export class UserResolver {
  @Authorized([ADMIN])
  @Query(() => [User])
  async users() {
    return await UserModel.find();
  }

  @FieldResolver()
  async templates(@Root() { _id }: User) {
    return await TemplateModel.find({
      owner: _id,
    });
  }

  @FieldResolver()
  async upvotedTemplates(@Root() { _id }: User) {
    return (
      (await UserModel.findById(_id).populate("upvotedTemplates"))
        ?.upvotedTemplates ?? []
    );
  }

  @Authorized()
  @Mutation(() => Boolean)
  async toggleUpvote(
    @Arg("id", () => ObjectIdScalar) templateId: ObjectId,
    @Ctx() { user }: IContext
  ) {
    const userUpvotes = await UserModel.findById(user._id).populate(
      "upvotedTemplates"
    );

    if (!userUpvotes) {
      throw new Error("Error user not found");
    }
    let added = false;

    if (
      userUpvotes.upvotedTemplates.find(template =>
        templateId.equals(isDocument(template) ? template._id : template)
      )
    ) {
      userUpvotes.upvotedTemplates = userUpvotes.upvotedTemplates.filter(
        template =>
          !templateId.equals(isDocument(template) ? template._id : template)
      );
      added = false;
    } else {
      const template = await TemplateModel.findById(templateId);
      if (template) {
        userUpvotes.upvotedTemplates.push(template);
        added = true;
      }
    }

    await userUpvotes.save();
    return added;
  }
}
