import { Field, ObjectType } from "type-graphql";
import { Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from "typeorm";

import { Language } from "./language";
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
  @JoinColumn({ name: "repository" })
  repository: GitRepository;

  @Field(_type => [Language], { nullable: true })
  @ManyToMany(_type => Language, language => language.publishedRepositories, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinTable()
  languages?: Language[];
}
