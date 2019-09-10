import { Field, ObjectType } from "type-graphql";

import { GitHubUser } from "../types/GitHubUser";
import { OrganizationGitHub } from "./OrganizationGitHub";
import { RepositoryGitHub } from "./RepositoryGitHub";

@ObjectType()
export class UserGitHubAPI implements GitHubUser {
  @Field()
  id: string;

  @Field()
  avatarUrl: string;

  @Field()
  login: string;

  @Field()
  url: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => [RepositoryGitHub])
  repositories: RepositoryGitHub[];

  @Field(() => [RepositoryGitHub])
  starredRepositories: RepositoryGitHub[];

  @Field(() => [OrganizationGitHub])
  organizations: OrganizationGitHub[];
}
