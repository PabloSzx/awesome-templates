import { Field, ObjectType } from "type-graphql";

import { GitHubRepository } from "../types/GitHubRepository";
import { LanguageGitHub } from "./LanguageGitHub";
import { RepositoryOwnerGitHub } from "./RepositoryOwnerGitHub";

@ObjectType()
export class RepositoryGitHub implements GitHubRepository {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  isLocked: boolean;

  @Field()
  isArchived: boolean;

  @Field()
  isDisabled: boolean;

  @Field()
  isFork: boolean;

  @Field()
  isTemplate: boolean;

  @Field()
  forkCount: number;

  @Field()
  name: string;

  @Field()
  nameWithOwner: string;

  @Field()
  description?: string;

  @Field()
  url: string;

  @Field(() => LanguageGitHub, { nullable: true })
  primaryLanguage?: LanguageGitHub;

  @Field(() => RepositoryOwnerGitHub)
  owner: RepositoryOwnerGitHub;

  @Field(() => [LanguageGitHub])
  languages: LanguageGitHub[];

  @Field()
  starCount: number;
}
