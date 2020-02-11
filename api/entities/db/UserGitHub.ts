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
import { Organization } from "./Organization";

@ObjectType()
export class UserGitHub {
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

  @Field()
  @Property()
  email: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  bio?: string;

  @Field(() => [GitRepository])
  @PropertyArray({ items: "GitRepository", ref: "GitRepository", default: [] })
  repositories: Ref<GitRepository>[];

  @Field(() => [GitRepository])
  @PropertyArray({ items: "GitRepository", ref: "GitRepository", default: [] })
  starredRepositories: Ref<GitRepository>[];

  @Field(() => [Organization])
  @PropertyArray({ items: "Organization", ref: "Organization", default: [] })
  organizations: Ref<Organization>[];
}

export const UserGitHubModel = getModelForClass(UserGitHub);
