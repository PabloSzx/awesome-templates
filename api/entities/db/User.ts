import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { APILevel } from "../../consts";
import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { Template } from "./Template";
import { UserGitHub } from "./UserGitHub";

@ObjectType()
export class User {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Property({ unique: true, required: true })
  githubId: string;

  @Field()
  @Property({ default: false })
  admin: boolean;

  @Property()
  accessToken: string;

  @Field(() => APILevel)
  @Property({ enum: APILevel, default: APILevel.BASIC })
  APILevel: APILevel;

  @Property({ nullable: true })
  personalAccessToken?: string;

  // template => owner
  @Field(() => [Template])
  templates: Template[];

  @Field(() => [Template])
  @PropertyArray({ items: "Template", ref: "Template", default: [] })
  upvotedTemplates: Ref<Template>[];

  @Field(() => UserGitHub)
  @Property({ ref: "UserGitHub", index: true })
  data: Ref<UserGitHub>;
}

export const UserModel = getModelForClass(User);
