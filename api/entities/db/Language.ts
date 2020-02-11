import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { LanguageGitHub } from "../githubAPI/LanguageGitHub";
import { Framework } from "./Framework";
import { GitRepository } from "./GitRepository";
import { Library } from "./Library";
import { Template } from "./Template";

@ObjectType()
export class Language implements LanguageGitHub {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ index: true, unique: true })
  name: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  color?: string;

  @Field(() => [GitRepository])
  @PropertyArray({ items: "GitRepository", ref: "GitRepository", default: [] })
  repositories: Ref<GitRepository>[];

  @Field(() => [GitRepository])
  @PropertyArray({ items: "GitRepository", ref: "GitRepository", default: [] })
  primaryRepositories: Ref<GitRepository>[];

  @Field(() => [Template])
  @PropertyArray({ items: "Template", ref: "Template", default: [] })
  templates: Ref<Template>[];

  @Field(() => [Template])
  @PropertyArray({ items: "Template", ref: "Template", default: [] })
  primaryTemplates: Ref<Template>[];

  @Field(() => [Framework])
  @PropertyArray({ items: "Framework", ref: "Framework", default: [] })
  frameworks: Ref<Framework>[];

  @Field(() => [Library])
  @PropertyArray({ items: "Library", ref: "Library", default: [] })
  libraries: Ref<Library>[];
}

export const LanguageModel = getModelForClass(Language);
