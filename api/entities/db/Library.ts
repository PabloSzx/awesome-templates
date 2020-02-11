import { IsUrl, Length, MinLength } from "class-validator";
import { ObjectId } from "mongodb";
import { ArgsType, Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { Language } from "./Language";
import { Template } from "./Template";
import { User } from "./User";

@ObjectType()
export class Library {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  description?: string;

  @Field(() => Language, { nullable: true })
  @Property({ ref: "Language", index: true })
  language?: Ref<Language>;

  @Field(() => [Template])
  @PropertyArray({ items: "Template", ref: "Template", default: [] })
  templates: Ref<Template>[];

  @Field(() => User)
  @Property({ ref: "User", index: true })
  creator: Ref<User>;
}

export const LibraryModel = getModelForClass(Library);

@ArgsType()
export class CreateLibraryInput {
  @Length(2, 60)
  @Field()
  name: string;

  @IsUrl({
    allow_underscores: true,
    protocols: ["http", "https"],
    require_protocol: true,
  })
  @Field({ nullable: true })
  url?: string;

  @IsUrl({
    protocols: ["http", "https"],
    require_protocol: true,
    allow_underscores: true,
    host_whitelist: ["i.imgur.com", /.*githubusercontent.com/],
  })
  @Field({ nullable: true })
  logoUrl?: string;

  @MinLength(5)
  @Field({ nullable: true })
  description?: string;

  @MinLength(1)
  @Field(() => ObjectIdScalar, { nullable: true })
  language?: ObjectId;
}

@ArgsType()
export class UpdateLibraryInput implements Partial<CreateLibraryInput> {
  @Field(() => ObjectIdScalar)
  _id: string;

  @Length(2, 60)
  @Field()
  name: string;

  @IsUrl({
    allow_underscores: true,
    protocols: ["http", "https"],
    require_protocol: true,
  })
  @Field({ nullable: true })
  url?: string;

  @IsUrl({
    protocols: ["http", "https"],
    require_protocol: true,
    allow_underscores: true,
    host_whitelist: ["i.imgur.com", /.*githubusercontent.com/],
  })
  @Field({ nullable: true })
  logoUrl?: string;

  @MinLength(5)
  @Field({ nullable: true })
  description?: string;

  @MinLength(1)
  @Field(() => ObjectIdScalar, { nullable: true })
  language?: ObjectId;
}
