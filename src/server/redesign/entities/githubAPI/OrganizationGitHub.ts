import { Field, ObjectType } from "type-graphql";

import { GitHubOrganization } from "../types/GitHubOrganization";
import { RepositoryGitHub } from "./RepositoryGitHub";
import { UserGitHubAPI } from "./UserGitHubAPI";

@ObjectType()
export class OrganizationGitHub implements GitHubOrganization {
  @Field()
  id: string;

  @Field()
  avatarUrl: string;

  @Field()
  login: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  websiteUrl?: string;

  @Field(() => [UserGitHubAPI])
  members: UserGitHubAPI[];

  @Field(() => [RepositoryGitHub])
  repositories: RepositoryGitHub[];
}
