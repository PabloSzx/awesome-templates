import { FieldResolver, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserGitHub } from "../../entities";

@Resolver(() => UserGitHub)
export class UserGitHubResolver {
  constructor(
    @InjectRepository(UserGitHub)
    private readonly UserGitHubRepository: Repository<UserGitHub>
  ) {}

  @FieldResolver()
  async organizations(@Root() { id }: UserGitHub) {
    return (await this.UserGitHubRepository.findOneOrFail(id, {
      relations: ["organizations"],
    })).organizations;
  }
}
