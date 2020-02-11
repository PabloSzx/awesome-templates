import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { Language } from "./Language";
import { RepositoryOwner } from "./RepositoryOwner";
import { Template } from "./Template";
import { UserGitHub } from "./UserGitHub";

@ObjectType()
export class GitRepository {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Property({ unique: true, required: true })
  githubId: string;

  @Field()
  @Property()
  createdAt: Date;

  @Field()
  @Property()
  updatedAt: Date;

  @Field()
  @Property()
  isLocked: boolean;

  @Field()
  @Property()
  isArchived: boolean;

  @Field()
  @Property()
  isDisabled: boolean;

  @Field()
  @Property()
  isFork: boolean;

  @Field()
  @Property()
  isTemplate: boolean;

  @Field()
  @Property()
  forkCount: number;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  nameWithOwner: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  description?: string;

  @Field()
  @Property()
  url: string;

  @Field(() => Language, { nullable: true })
  @Property({ ref: "Language", index: true })
  primaryLanguage?: Ref<Language>;

  @Field(() => RepositoryOwner)
  @Property({ ref: "RepositoryOwner", index: true })
  owner?: Ref<RepositoryOwner>;

  @Field(() => [Language])
  @PropertyArray({ items: "Language", ref: "Language", default: [] })
  languages: Ref<Language>[];

  @Field()
  @Property({ default: -1 })
  starCount: number;

  @Field(() => [UserGitHub])
  @PropertyArray({ items: "Language", ref: "Language", default: [] })
  stargazers: Ref<UserGitHub>[];

  @Field(() => Template, { nullable: true })
  @Property({ ref: "RepositoryOwner", index: true })
  template?: Ref<Template>;
}

export const GitRepositoryModel = getModelForClass(GitRepository);
