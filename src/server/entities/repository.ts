import { Type } from "class-transformer";
import { Field, ID, ObjectType } from "type-graphql";
import {
    Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn
} from "typeorm";

import { RepositoryOwner } from "./repositoryOwner";
import { User } from "./user";

@ObjectType()
@Entity()
export class Language {
  @Field()
  @PrimaryColumn()
  name: string;

  @Type(() => GitRepository)
  @Field(_type => [GitRepository], { defaultValue: [] })
  @OneToMany(_type => GitRepository, repository => repository.id, {})
  repositories?: GitRepository[];
}

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
  })
  primaryLanguage?: Language;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column()
  url: string;
}

@ObjectType()
@Entity()
export class GitRepository extends RepositoryGithubData {
  @Field()
  @Column()
  starCount: number;

  @Field(_type => [User])
  @ManyToMany(_type => User, user => user.id)
  stargazers: User[];

  @Field(_type => RepositoryOwner)
  @ManyToOne(_type => RepositoryOwner, owner => owner.id, { cascade: true })
  owner: RepositoryOwner;

  @Field(_type => [Language], { nullable: true })
  @ManyToMany(_type => Language, language => language.name, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  languages?: Language[];
}
