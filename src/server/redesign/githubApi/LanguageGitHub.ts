import { Field, ObjectType } from "type-graphql";

import { GitHubLanguage } from "../classTypes/GitHubLanguage";

@ObjectType()
export class LanguageGitHub implements GitHubLanguage {
  @Field()
  name: string;

  @Field()
  color?: string;
}
