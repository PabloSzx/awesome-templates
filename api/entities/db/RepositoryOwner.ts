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
import { UserGitHub } from "./UserGitHub";

@ObjectType()
export class RepositoryOwner {
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

  @Field(() => UserGitHub, { nullable: true })
  @Property({ ref: "UserGitHub", index: true })
  user?: Ref<UserGitHub>;

  @Field(() => Organization, { nullable: true })
  @Property({ ref: "Organization", index: true })
  organization?: Ref<Organization>;

  @Field(() => [GitRepository])
  @PropertyArray({ items: "GitRepository", ref: "GitRepository", default: [] })
  repositories: Ref<GitRepository>[];
}

export const RepositoryOwnerModel = getModelForClass(RepositoryOwner);
