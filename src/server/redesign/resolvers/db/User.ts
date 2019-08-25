import { Authorized, Query, Resolver } from "type-graphql";
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
}
