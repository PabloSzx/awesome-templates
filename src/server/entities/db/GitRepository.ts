import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";

import { RepositoryGitHub } from "../githubAPI/RepositoryGitHub";
import { Language } from "./Language";
import { RepositoryOwner } from "./RepositoryOwner";
import { UserGitHub } from "./UserGitHub";

@Entity()
@ObjectType()
export class GitRepository implements RepositoryGitHub {
  @Field(() => ID)
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

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column()
  url: string;

  @Field(() => Language, { nullable: true })
  @ManyToOne(() => Language, lang => lang.primaryRepositories, {
    cascade: true,
    eager: true,
  })
  primaryLanguage?: Language;

  @Field(() => RepositoryOwner)
  @ManyToOne(() => RepositoryOwner, repoOwner => repoOwner.repositories, {
    cascade: ["insert", "update"],
    nullable: true,
    eager: true,
  })
  owner: RepositoryOwner;

  @Field(() => [Language])
  @ManyToMany(() => Language, lang => lang.repositories, {
    cascade: true,
  })
  @JoinTable()
  languages: Language[];

  @Field()
  @Column({ default: -1 })
  starCount: number;

  @Field(() => [UserGitHub])
  @ManyToMany(() => UserGitHub, user => user.starredRepositories)
  stargazers: UserGitHub[];
}
