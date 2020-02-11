import { FieldResolver, Query, Resolver, Root } from "type-graphql";

import { Language, LanguageModel } from "../../entities";

@Resolver(() => Language)
export class LanguageResolver {
  @Query(() => [Language])
  async languages() {
    return await LanguageModel.find();
  }

  @FieldResolver()
  async repositories(@Root() { _id }: Language) {
    return (
      (await LanguageModel.findById(_id).populate("repositories"))
        ?.repositories ?? []
    );
  }
  @FieldResolver()
  async primaryRepositories(@Root() { _id }: Language) {
    return (
      (await LanguageModel.findById(_id).populate("primaryRepositories"))
        ?.primaryRepositories ?? []
    );
  }
  @FieldResolver()
  async templates(@Root() { _id }: Language) {
    return (
      (await LanguageModel.findById(_id).populate("templates"))?.templates ?? []
    );
  }
  @FieldResolver()
  async primaryTemplates(@Root() { _id }: Language) {
    return (
      (await LanguageModel.findById(_id).populate("primaryTemplates"))
        ?.primaryTemplates ?? []
    );
  }
  @FieldResolver()
  async frameworks(@Root() { _id }: Language) {
    return (
      (await LanguageModel.findById(_id).populate("frameworks"))?.frameworks ??
      []
    );
  }
  @FieldResolver()
  async libraries(@Root() { _id }: Language) {
    return (await LanguageModel.findById(_id))?.libraries ?? [];
  }
}
