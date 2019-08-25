import { Type } from "class-transformer";
import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";

import { Language } from "./language";
import { RepositoryOwner } from "./repositoryOwner";
import { User } from "./user";

@ObjectType()
export class RepositoryGithubData {
  @Field(_type => ID)
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  createdAt: Date;

  @Field()
  @Column()
  updatedAt: Date;

  @Field()
  @Column()
  isLocked: boolean;

  @Field()
  @Column()
  isArchived: boolean;

  @Field()
  @Column()
  isDisabled: boolean;

  @Field()
  @Column()
  isFork: boolean;

  @Field()
  @Column()
  isTemplate: boolean;

  @Field()
  @Column()
  forkCount: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  nameWithOwner: string;

  @Type(() => Language)
  @Field(_type => Language, { nullable: true })
  @ManyToOne(_type => Language, language => language.repositories, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  primaryLanguage?: Language;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column()
  url: string;

  @Field(_type => RepositoryOwner)
  @ManyToOne(_type => RepositoryOwner, repoOwner => repoOwner.repositories, {
    cascade: true,
    eager: true,
  })
  owner: RepositoryOwner;
}

@ObjectType()
@Entity()
export class GitRepository extends RepositoryGithubData {
  @Field()
  @Column({ default: -1 })
  starCount: number;

  @Field(_type => [User])
  @ManyToMany(_type => User, user => user.starredRepositories, {})
  stargazers: User[];

  @Field(_type => [Language], { nullable: true })
  @ManyToMany(_type => Language, language => language.repositories, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinTable()
  languages?: Language[];
}
