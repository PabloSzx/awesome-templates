import { IsEmail, Length } from "class-validator";
import { Ctx, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { User } from "../entities";
import { IContext } from "../interfaces";

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(3, 100)
  password: string;
}

@InputType()
export class SignUpInput extends LoginInput {
  @Field({ nullable: true, defaultValue: "Default" })
  name: string;
}

@Resolver()
export class AuthResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>
  ) {}

  @Query(_returns => User, { nullable: true })
  async current_user(@Ctx() { isAuthenticated, user }: IContext) {
    if (isAuthenticated()) {
      return user;
    }
  }

  @Mutation(_returns => Boolean)
  logout(@Ctx() { logout, isAuthenticated }: IContext) {
    if (isAuthenticated()) {
      logout();
      return true;
    }
    return false;
  }
}
