import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserGitHub } from "../../entities";

@Resolver(() => UserGitHub)
export class UserGitHubResolver {
  constructor(
    @InjectRepository(UserGitHub)
    private readonly UserGitHubRepository: Repository<UserGitHub>
  ) {}

  @Query(() => [UserGitHub])
  async usersGitHubDB() {
    return await this.UserGitHubRepository.find();
  }

  @FieldResolver()
  async repositories(@Root() { id }: UserGitHub) {
    return (await this.UserGitHubRepository.findOneOrFail(id, {
      relations: ["repositories"],
    })).repositories;
  }

  @FieldResolver()
  async starredRepositories(@Root() { id }: UserGitHub) {
    return (await this.UserGitHubRepository.findOneOrFail(id, {
      relations: ["starredRepositories"],
    })).starredRepositories;
  }

  @FieldResolver()
  async organizations(@Root() { id }: UserGitHub) {
    return (await this.UserGitHubRepository.findOneOrFail(id, {
      relations: ["organizations"],
    })).organizations;
  }
}
