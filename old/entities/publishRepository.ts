import { Field, ObjectType } from "type-graphql";
import { Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from "typeorm";

import { Framework } from "./framework";
import { Language } from "./language";
import { Library } from "./library";
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

  @Field(_type => [Language], {})
  @ManyToMany(_type => Language, language => language.publishedRepositories, {
    cascade: true,
  })
  @JoinTable()
  languages?: Language[];

  @Field(_type => [Framework], {})
  @ManyToMany(_type => Framework, framework => framework.repositories, {
    cascade: true,
  })
  @JoinTable()
  frameworks?: Framework[];

  @Field(_type => [Library], {})
  @ManyToMany(_type => Library, lib => lib.repositories, {
    cascade: true,
  })
  @JoinTable()
  libraries?: Library[];
}
