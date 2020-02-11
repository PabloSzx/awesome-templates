import { Arg, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { RepositoryOwner, RepositoryOwnerModel } from "../../entities";

@Resolver(() => RepositoryOwner)
export class RepositoryOwnerResolver {
  @Query(() => [RepositoryOwner])
  async repositoryOwners() {
    return await RepositoryOwnerModel.find();
  }

  @Query(() => RepositoryOwner, { nullable: true })
  async repositoryOwnerDB(@Arg("id") id: string) {
    return await RepositoryOwnerModel.findById(id);
  }

  @FieldResolver()
  async repositories(@Root() { _id }: RepositoryOwner) {
    return (
      (await RepositoryOwnerModel.findById(_id).populate("repositories"))
        ?.repositories ?? []
    );
  }
}
