import { IsUrl, Length } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";

import { Language } from "./language";
import { PublishedRepository } from "./publishRepository";

@ObjectType()
@Entity()
export class Framework {
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

  @Field(_type => [Language], {})
  @ManyToMany(_type => Language, lang => lang.frameworks, {
    cascade: true,
  })
  @JoinTable()
  languages?: Language[];

  @Field(_type => [PublishedRepository], {})
  @ManyToMany(
    _type => PublishedRepository,
    publishedRepo => publishedRepo.frameworks,
    {}
  )
  repositories?: PublishedRepository[];
}

@InputType()
export class CreateFrameworkInput implements Partial<Framework> {
  @Length(3, 30)
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

  // TODO: Test creation of this relation only via primary keys
  @Field(_type => [String])
  languagesNames: string[];
}
