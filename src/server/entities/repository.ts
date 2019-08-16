import { Field, ID, ObjectType } from "type-graphql";
import {
    Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn
} from "typeorm";

import { RepositoryOwner } from "./repositoryOwner";
import { User } from "./user";

@ObjectType()
@Entity()
export class Language {
  @Field(_type => ID)
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  color: string;

  @Field()
  @Column()
  name: string;

  @Field(_type => [GitRepository], { defaultValue: [] })
  @OneToMany(_type => GitRepository, repository => repository.id, {})
  repositories?: GitRepository[];
}

@ObjectType()
@Entity()
export class GitRepository {
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
  starCount: number;

  @Field()
  @Column()
  issues: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  nameWithOwner: string;

  @Field(_type => RepositoryOwner)
  @ManyToOne(_type => RepositoryOwner, owner => owner.id, { cascade: true })
  owner: RepositoryOwner;

  @Field(_type => [Language])
  @ManyToMany(_type => Language, language => language.id, { cascade: true })
  @JoinTable()
  languages: Language[];

  @Field(_type => [User])
  @ManyToMany(_type => User, user => user.id)
  collaborators: User[];

  @Field(_type => [User])
  @ManyToMany(_type => User, user => user.id)
  stargazers: User[];

  @Field()
  @ManyToOne(_type => Language, language => language.repositories, {
    cascade: true,
  })
  primaryLanguage: Language;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  resourcePath: string;
}
