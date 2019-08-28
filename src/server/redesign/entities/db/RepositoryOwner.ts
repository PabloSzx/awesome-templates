import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

import { RepositoryOwnerGitHub } from "../githubAPI/RepositoryOwnerGitHub";
import { GitRepository } from "./GitRepository";
import { Organization } from "./Organization";
import { UserGitHub } from "./UserGitHub";

@Entity()
@ObjectType()
export class RepositoryOwner implements RepositoryOwnerGitHub {
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

  @Field(() => UserGitHub, { nullable: true })
  @OneToOne(() => UserGitHub, { cascade: true, eager: true })
  @JoinColumn({ name: "user" })
  user?: UserGitHub;

  @Field(() => Organization, { nullable: true })
  @OneToOne(() => Organization, { cascade: true, eager: true })
  @JoinColumn({ name: "organization" })
  organization?: Organization;

  @Field(() => [GitRepository])
  @OneToMany(() => GitRepository, repo => repo.owner)
  repositories: GitRepository[];
}
