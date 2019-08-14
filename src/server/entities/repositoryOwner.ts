import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { GitRepository } from "./repository";

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
  @OneToMany(_type => GitRepository, repository => repository.id, {
    cascade: true,
  })
  repositories: GitRepository[];
}
