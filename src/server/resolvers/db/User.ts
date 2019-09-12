import { Authorized, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { ADMIN } from "../../../consts";
import { User } from "../../entities";

@Resolver(() => User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>
  ) {}

  @Authorized([ADMIN])
  @Query(() => [User])
  async users() {
    return await this.UserRepository.find();
  }

  @FieldResolver()
  async templates(@Root() { id }: User) {
    return (await this.UserRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }

  @FieldResolver()
  async upvotedTemplates(@Root() { id }: User) {
    return (await this.UserRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["upvotedTemplates"],
      loadEagerRelations: false,
    })).upvotedTemplates;
  }
}
