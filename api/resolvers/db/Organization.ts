import { FieldResolver, Query, Resolver, Root } from "type-graphql";

import { Organization, OrganizationModel } from "../../entities";

@Resolver(() => Organization)
export class OrganizationResolver {
  @Query(() => [Organization])
  async organizations() {
    return await OrganizationModel.find();
  }

  @FieldResolver()
  async members(@Root() { _id }: Organization) {
    return (
      (await OrganizationModel.findById(_id).populate("members"))?.members ?? []
    );
  }

  @FieldResolver()
  async repositories(@Root() { _id }: Organization) {
    return (
      (await OrganizationModel.findById(_id).populate("repositories"))
        ?.repositories ?? []
    );
  }
}
