import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";

import { Language } from "./Language";
import { Template } from "./Template";

@Entity()
@ObjectType()
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

  @Field(() => Language)
  @ManyToOne(() => Language, lang => lang.libraries, {
    cascade: true,
    nullable: false,
  })
  language: Language;

  @Field(_type => [Template])
  @ManyToMany(() => Template, template => template.libraries)
  templates: Template[];
}
