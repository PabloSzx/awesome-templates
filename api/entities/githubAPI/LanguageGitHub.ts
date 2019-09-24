import { Field, ObjectType } from "type-graphql";

import { GitHubLanguage } from "../types/GitHubLanguage";

@ObjectType()
export class LanguageGitHub implements GitHubLanguage {
  @Field()
  name: string;

  @Field({ nullable: true })
  color?: string;
}
