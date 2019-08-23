import { IsHexColor, Length } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

import { Framework } from "./framework";
import { Library } from "./library";
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

  @Field()
  @Column({ default: 0 })
  publishedRepositoriesCount: number;

  @Field(_type => [GitRepository], {})
  @ManyToMany(_type => GitRepository, repository => repository.languages, {})
  repositories?: GitRepository[];

  @Field(_type => [PublishedRepository], {})
  @ManyToMany(
    _type => PublishedRepository,
    publishedRepo => publishedRepo.languages,
    {}
  )
  publishedRepositories?: PublishedRepository[];

  @Field(_type => [Framework], {})
  @ManyToMany(_type => Framework, framework => framework.languages, {})
  frameworks?: Framework[];

  @Field(_type => [Library], {})
  @OneToMany(_type => Library, lib => lib.language, {})
  libraries?: Library[];
}

@InputType()
export class CreateLanguageInput implements Partial<Language> {
  @Length(1, 60)
  @Field()
  name: string;

  @IsHexColor()
  @Field({ nullable: true })
  color?: string;
}
