import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";

import { PublishedRepository } from "./publishRepository";
import { GitRepository } from "./repository";

@ObjectType()
@Entity()
export class Language {
  @Field()
  @PrimaryColumn()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  color?: string;

  @Field(_type => [GitRepository], { defaultValue: [] })
  @ManyToMany(_type => GitRepository, repository => repository.languages, {})
  repositories?: GitRepository[];

  @Field(_type => [PublishedRepository], { defaultValue: [] })
  @ManyToMany(
    _type => PublishedRepository,
    publishedRepo => publishedRepo.languages
  )
  publishedRepositories?: PublishedRepository[];

  @Field()
  @Column({ default: 0 })
  publishedRepositoriesCount: number;
}
