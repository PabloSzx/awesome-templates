import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitRepository } from "../../entities";

@Resolver(() => GitRepository)
export class GitRepositoryResolver {
  constructor(
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>
  ) {}

  @Query(() => [GitRepository])
  async gitRepositories() {
    return await this.GitRepoRepository.find();
  }

  @FieldResolver()
  async languages(@Root() { id }: GitRepository) {
    return (await this.GitRepoRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["languages"],
      loadEagerRelations: false,
    })).languages;
  }

  @FieldResolver()
  async stargazers(@Root() { id }: GitRepository) {
    return (await this.GitRepoRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["stargazers"],
      loadEagerRelations: false,
    })).stargazers;
  }
}
