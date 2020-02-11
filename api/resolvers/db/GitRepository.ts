import { Arg, FieldResolver, Query, Resolver, Root } from "type-graphql";

import { GitRepository, GitRepositoryModel } from "../../entities";

@Resolver(() => GitRepository)
export class GitRepositoryResolver {
  @Query(() => [GitRepository])
  async gitRepositories() {
    return await GitRepositoryModel.find();
  }

  @Query(() => GitRepository, { nullable: true })
  async gitRepo(@Arg("id") id: string) {
    return await GitRepositoryModel.findById(id);
  }

  @FieldResolver()
  async languages(@Root() { _id }: GitRepository) {
    return (
      (await GitRepositoryModel.findById(_id).populate("languages"))
        ?.languages ?? []
    );
  }

  @FieldResolver()
  async stargazers(@Root() { _id }: GitRepository) {
    return (
      (await GitRepositoryModel.findById(_id).populate("stargazers"))
        ?.stargazers ?? []
    );
  }

  @FieldResolver()
  async template(@Root() { _id }: GitRepository) {
    return (await GitRepositoryModel.findById(_id).populate("template"))
      ?.template;
  }
}
