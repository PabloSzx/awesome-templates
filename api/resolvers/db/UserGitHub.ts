import { FieldResolver, Query, Resolver, Root } from "type-graphql";

import { UserGitHub, UserGitHubModel } from "../../entities";

@Resolver(() => UserGitHub)
export class UserGitHubResolver {
  @Query(() => [UserGitHub])
  async usersGitHubDB() {
    return await UserGitHubModel.find();
  }

  @FieldResolver()
  async repositories(@Root() { _id }: UserGitHub) {
    return (
      (await UserGitHubModel.findById(_id).populate("repositories"))
        ?.repositories ?? []
    );
  }

  @FieldResolver()
  async starredRepositories(@Root() { _id }: UserGitHub) {
    return (
      (await UserGitHubModel.findById(_id).populate("starredRepositories"))
        ?.starredRepositories ?? []
    );
  }

  @FieldResolver()
  async organizations(@Root() { _id }: UserGitHub) {
    return (
      (await UserGitHubModel.findById(_id).populate("organizations"))
        ?.organizations ?? []
    );
  }
}
