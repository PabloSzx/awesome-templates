import { Field, ObjectType } from "type-graphql";
import { Entity, JoinColumn, OneToOne } from "typeorm";

import { GitRepository } from "./repository";

@ObjectType()
@Entity()
export class PublishedRepository {
  @Field(_type => GitRepository)
  @OneToOne(_type => GitRepository, {
    cascade: true,
    primary: true,
    eager: true,
  })
  @JoinColumn()
  repository: GitRepository;
}
