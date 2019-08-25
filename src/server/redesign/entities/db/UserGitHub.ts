import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

import { UserGitHubAPI } from "../githubAPI/UserGitHubAPI";
import { GitRepository } from "./GitRepository";
import { Organization } from "./Organization";

@Entity()
@ObjectType()
export class UserGitHub implements UserGitHubAPI {
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

  @Field()
  @Column()
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bio?: string;

  @Field(() => [GitRepository])
  @OneToMany(() => GitRepository, repo => repo.owner)
  repositories: GitRepository[];

  @Field(() => [GitRepository])
  @ManyToMany(() => GitRepository, repo => repo.stargazers, {
    cascade: true,
  })
  @JoinTable()
  starredRepositories: GitRepository[];

  @Field(() => [Organization])
  @ManyToMany(() => Organization, org => org.members, {
    cascade: true,
  })
  organizations: Organization[];
}
