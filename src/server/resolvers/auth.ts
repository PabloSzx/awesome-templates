import { IsEmail, Length } from "class-validator";
import gql from "graphql-tag";
import { Authorized, Ctx, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
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

  @Authorized()
  @Query(_returns => String)
  async templates(@Ctx() { authGitHub: context }: IContext) {
    try {
      const { data } = await GitHubAPI.query({
        query: gql`
          query {
            viewer {
              repositories(last: 100, privacy: PUBLIC) {
                totalCount
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  isTemplate
                  name
                  url
                  id
                }
              }
            }
          }
        `,
        context,
      });

      return JSON.stringify(
        data.viewer.repositories.nodes.filter((v: any) => v.isTemplate)
      );
    } catch (err) {
      return err.message;
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
