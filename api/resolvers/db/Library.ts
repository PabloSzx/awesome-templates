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
  CreateLibraryInput,
  Library,
  LibraryModel,
  UpdateLibraryInput,
} from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => Library)
export class LibraryResolver {
  @Query(() => [Library])
  async libraries() {
    return await LibraryModel.find();
  }

  @Query(() => Library, { nullable: true })
  async library(@Arg("id") id: string) {
    return await LibraryModel.findById(id);
  }

  @Authorized()
  @Mutation(() => [Library])
  async createLibrary(
    @Args()
    { ...newLibraryData }: CreateLibraryInput,
    @Ctx() { user: creator }: IContext
  ) {
    const newLibrary = await LibraryModel.findOneAndUpdate(
      {
        name: newLibraryData.name,
      },
      {
        ...newLibraryData,
        creator,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return newLibrary;
  }

  @Authorized()
  @Mutation(() => Library)
  async updateLibrary(
    @Args()
    { _id, ...updateLibraryData }: UpdateLibraryInput,
    @Ctx() { user }: IContext
  ) {
    let [library] = await Promise.all([
      LibraryModel.findById(_id).populate("creator"),
    ]);
    if (
      library &&
      (user.admin ||
        (library.creator &&
          isDocument(library.creator) &&
          library.creator.id === user.id))
    ) {
      _.assign(library, _.omitBy(updateLibraryData, _.isUndefined));

      return await library.save();
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @Authorized()
  @Mutation(() => String)
  async removeLibrary(@Arg("id") id: string, @Ctx() { user }: IContext) {
    const library = await LibraryModel.findById(id);

    if (
      library &&
      (user.admin ||
        (library.creator &&
          isDocument(library.creator) &&
          library.creator.id === user.id))
    ) {
      await LibraryModel.findByIdAndRemove(id);
      return id;
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @FieldResolver()
  async templates(@Root() { _id }: Library) {
    return (
      (await LibraryModel.findById(_id).populate("templates"))?.templates ?? []
    );
  }

  @FieldResolver()
  async creator(@Root() { _id }: Library) {
    return (await LibraryModel.findById(_id).populate("creator"))?.creator;
  }
}
