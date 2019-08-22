import { Field, ID, ObjectType } from "type-graphql";
import {
    Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryColumn
} from "typeorm";

import { APILevel } from "../consts";
import { Organization } from "./organization";
import { GitRepository } from "./repository";
import { RepositoryOwner } from "./repositoryOwner";

@ObjectType()
@Entity()
export class UserGitHubData implements RepositoryOwner {
  @Field(_type => ID)
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  avatarUrl: string;

  @Field()
  @Column()
  login: string;

  @Field()
  @Column()
  url: string;

  @Field()
  @Column()
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field(_type => String, { nullable: true })
  @Column({ nullable: true })
  bio?: string;
}

@ObjectType()
@Entity()
export class User extends UserGitHubData {
  @Field()
  @Column({ default: false })
  admin: boolean;

  @Column()
  accessToken: string;

  @Field(_type => [GitRepository], { defaultValue: [] })
  @OneToMany(_type => GitRepository, repository => repository.owner, {})
  repositories?: GitRepository[];

  @Field(_type => [GitRepository], { defaultValue: [] })
  @ManyToMany(_type => GitRepository, repository => repository.stargazers, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  starredRepositories?: GitRepository[];

  @Field(_type => [Organization], { defaultValue: [] })
  @ManyToMany(_type => Organization, organization => organization.members, {
    cascade: true,
    eager: true,
  })
  organizations?: Organization[];

  @Field(__type => APILevel)
  @Column({ type: "enum", enum: APILevel, default: APILevel.BASIC })
  APILevel: APILevel;

  @Column({ nullable: true })
  personalAccessToken?: string;

  @Field(_type => UserGitHubData)
  @OneToOne(_type => UserGitHubData, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: "userData" })
  userGitHubData: UserGitHubData;
}
