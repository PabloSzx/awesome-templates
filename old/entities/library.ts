import { IsUrl, Length } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";

import { Language } from "./language";
import { PublishedRepository } from "./publishRepository";

@ObjectType()
@Entity()
export class Library {
  @Field()
  @PrimaryColumn()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description?: string;

  @Field(_type => Language)
  @ManyToOne(_type => Language, lang => lang.libraries, {
    eager: true,
    cascade: true,
    nullable: false,
  })
  language: Language;

  @Field(_type => [PublishedRepository], {})
  @ManyToMany(
    _type => PublishedRepository,
    publishedRepo => publishedRepo.libraries,
    {}
  )
  repositories?: PublishedRepository[];
}

@InputType()
export class CreateLibraryInput implements Partial<Library> {
  @Length(2, 60)
  @Field()
  name: string;

  @IsUrl({
    protocols: ["http", "https"],
    require_protocol: true,
    allow_underscores: true,
  })
  @Field({ nullable: true })
  url?: string;

  @IsUrl({
    protocols: ["http", "https"],
    require_protocol: true,
    allow_underscores: true,
    host_whitelist: ["i.imgur.com", /.*githubusercontent.com/],
  })
  @Field({ nullable: true })
  avatarUrl?: string;

  @Length(5)
  @Field({ nullable: true })
  description?: string;

  // TODO: Test creation of this relation only via primary key
  @Length(1, 60)
  @Field()
  languageName: string;
}
