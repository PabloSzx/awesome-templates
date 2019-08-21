import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

import { GitRepository } from "./repository";
import { RepositoryOwner } from "./repositoryOwner";
import { UserGitHubData } from "./user";

@ObjectType()
@Entity()
export class Organization implements RepositoryOwner {
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
  @OneToMany(_type => GitRepository, repository => repository.owner, {
    cascade: true,
  })
  repositories?: GitRepository[];

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  websiteUrl: string;

  @Field(_type => [UserGitHubData])
  @ManyToMany(_type => UserGitHubData, member => member.id, { cascade: true })
  @JoinTable()
  members: UserGitHubData[];
}
