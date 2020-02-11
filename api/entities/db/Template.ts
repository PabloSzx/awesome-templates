import { MinLength } from "class-validator";
import { ObjectId } from "mongodb";
import { ArgsType, Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { Environment } from "./Environment";
import { Framework } from "./Framework";
import { GitRepository } from "./GitRepository";
import { Language } from "./Language";
import { Library } from "./Library";
import { User } from "./User";

@ObjectType()
export class Template {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  owner?: Ref<User>;

  @Field(() => User)
  @PropertyArray({ items: "User", ref: "User", default: [] })
  upvotes: Ref<User>[];

  @Field()
  upvotesCount: number;

  @Field(() => GitRepository, { nullable: true })
  @Property({ ref: "GitRepository", index: true })
  repository?: Ref<GitRepository>;

  @Field(() => [Language])
  @PropertyArray({ items: "Language", ref: "Language", default: [] })
  languages: Ref<Language>[];

  @Field(() => Language, { nullable: true })
  @Property({ ref: "Language", index: true })
  primaryLanguage?: Ref<Language>;

  @Field(() => [Library])
  @PropertyArray({ items: "Library", ref: "Library", default: [] })
  libraries: Ref<Library>[];

  @Field(() => [Environment])
  @PropertyArray({ items: "Environments", ref: "Environments", default: [] })
  environments: Ref<Environment>[];

  @Field(() => Framework)
  @PropertyArray({ items: "Frameworks", ref: "Frameworks", default: [] })
  frameworks: Ref<Framework>[];
}

@ArgsType()
export class CreateTemplateInput {
  @MinLength(3)
  @Field()
  name: string;

  @Field(() => ObjectIdScalar)
  repositoryId: ObjectId;

  @MinLength(1)
  @Field(() => ObjectIdScalar, { nullable: true })
  primaryLanguage?: ObjectId;

  @Field(() => [ObjectIdScalar])
  languages: ObjectId[];

  @Field(() => [ObjectIdScalar])
  frameworks: ObjectId[];

  @Field(() => [ObjectIdScalar])
  libraries: ObjectId[];

  @Field(() => [ObjectIdScalar])
  environments: ObjectId[];
}

export const TemplateModel = getModelForClass(Template);

@ArgsType()
export class UpdateTemplateInput implements Partial<CreateTemplateInput> {
  @Field(() => ObjectIdScalar)
  _id: string;

  @MinLength(3)
  @Field()
  name: string;

  @Field(() => ObjectIdScalar, { nullable: true })
  repositoryId?: ObjectId;

  @Field(() => ObjectIdScalar, { nullable: true })
  primaryLanguage?: ObjectId;

  @Field(() => [ObjectIdScalar])
  languages: ObjectId[];

  @Field(() => [ObjectIdScalar])
  frameworks: ObjectId[];

  @Field(() => [ObjectIdScalar])
  libraries: ObjectId[];

  @Field(() => [ObjectIdScalar])
  environments: ObjectId[];
}
