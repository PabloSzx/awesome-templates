import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

import { GitRepository } from "./repository";
import { RepositoryOwner } from "./repositoryOwner";
import { UserGitHubData } from "./user";

@ObjectType()
@Entity()
export class OrganizationGithubData implements RepositoryOwner {
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
}

@ObjectType()
@Entity()
export class Organization extends OrganizationGithubData {
  @Field(_type => GitRepository)
  @OneToMany(_type => GitRepository, repository => repository.owner, {
    cascade: true,
  })
  repositories?: GitRepository[];

  @Field(_type => [UserGitHubData])
  @ManyToMany(_type => UserGitHubData, member => member.id, { cascade: true })
  @JoinTable()
  members?: UserGitHubData[];
}
