import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

import { OrganizationGithubData } from "./organization";
import { GitRepository } from "./repository";
import { UserGitHubData } from "./user";

@ObjectType()
@Entity()
export class RepositoryOwner {
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

  @Field(_type => GitRepository)
  @OneToMany(_type => GitRepository, repository => repository.owner)
  repositories?: GitRepository[];

  @Field(_type => UserGitHubData, { nullable: true })
  @OneToOne(_type => UserGitHubData, { cascade: true })
  @JoinColumn()
  user?: UserGitHubData;

  @Field(_type => OrganizationGithubData, { nullable: true })
  @OneToOne(_type => OrganizationGithubData, { cascade: true })
  @JoinColumn()
  organization?: OrganizationGithubData;
}
