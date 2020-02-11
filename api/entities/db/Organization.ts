import { ObjectId } from "mongodb";
import { Field, ObjectType } from "type-graphql";

import {
  arrayProp as PropertyArray,
  getModelForClass,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";

import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { GitRepository } from "./GitRepository";
import { UserGitHub } from "./UserGitHub";

@ObjectType()
export class Organization {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Property({ unique: true, required: true })
  githubId: string;

  @Field()
  @Property()
  avatarUrl: string;

  @Field()
  @Property()
  login: string;

  @Field()
  @Property()
  url: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  websiteUrl?: string;

  @Field(() => [UserGitHub])
  @PropertyArray({ items: "UserGitHub", ref: "UserGitHub", default: [] })
  members: Ref<UserGitHub>[];

  @Field(() => GitRepository)
  @PropertyArray({ items: "GitRepository", ref: "GitRepository", default: [] })
  repositories: Ref<GitRepository>[];
}

export const OrganizationModel = getModelForClass(Organization);
