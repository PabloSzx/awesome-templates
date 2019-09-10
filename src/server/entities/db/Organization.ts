import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

import { OrganizationGitHub } from "../githubAPI/OrganizationGitHub";
import { GitRepository } from "./GitRepository";
import { UserGitHub } from "./UserGitHub";

@Entity()
@ObjectType()
export class Organization implements OrganizationGitHub {
  @Field()
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

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  websiteUrl?: string;

  @Field(() => [UserGitHub])
  @ManyToMany(() => UserGitHub, member => member.organizations)
  @JoinTable()
  members: UserGitHub[];

  @Field(() => GitRepository)
  @OneToMany(() => GitRepository, repo => repo.owner)
  repositories: GitRepository[];
}
