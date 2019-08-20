import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

import { Organization } from "./organization";
import { GitRepository } from "./repository";
import { RepositoryOwner } from "./repositoryOwner";

@ObjectType()
export class UserGitHubData {
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
export class User extends UserGitHubData implements RepositoryOwner {
  @Field()
  @Column({ default: false })
  admin: boolean;

  @Field()
  @Column()
  accessToken: string;

  @Field(_type => [GitRepository], { defaultValue: [] })
  @OneToMany(_type => GitRepository, repository => repository.id, {
    cascade: true,
  })
  repositories: GitRepository[];

  @Field(_type => [GitRepository], { defaultValue: [] })
  @ManyToMany(_type => GitRepository, repository => repository.stargazers, {
    cascade: true,
  })
  @JoinTable()
  starredRepositories: GitRepository[];

  @Field(_type => [Organization], { defaultValue: [] })
  @ManyToMany(_type => Organization, organization => organization.id, {
    cascade: true,
  })
  organizations: Organization[];
}
