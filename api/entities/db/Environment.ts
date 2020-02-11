import { IsUrl, Length } from "class-validator";
import { ObjectId } from "mongodb";
import { ArgsType, Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { Template } from "./Template";
import { User } from "./User";

@ObjectType()
export class Environment {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ unique: true })
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

  @Field(() => [Template])
  @PropertyArray({ items: "Template", ref: "Template", default: [] })
  templates: Ref<Template>[];

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  creator?: Ref<User>;
}

export const EnvironmentModel = getModelForClass(Environment);

@ArgsType()
export class CreateEnvironmentInput {
  @Length(2, 30)
  @Field()
  name: string;

  @IsUrl({
    protocols: ["http", "https"],
    require_protocol: true,
    allow_underscores: true,
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

  @Length(5)
  @Field({ nullable: true })
  description?: string;
}

@ArgsType()
export class UpdateEnvironmentInput implements Partial<CreateEnvironmentInput> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;

  @Length(2, 30)
  @Field()
  name: string;

  @IsUrl({
    protocols: ["http", "https"],
    require_protocol: true,
    allow_underscores: true,
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

  @Length(5)
  @Field({ nullable: true })
  description?: string;
}
