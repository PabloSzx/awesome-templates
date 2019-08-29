import { IsUrl, Length, MinLength } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import {
    Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn
} from "typeorm";

import { Language } from "./Language";
import { Template } from "./Template";
import { User } from "./User";

@Entity()
@ObjectType()
export class Framework {
  @Field()
  @PrimaryColumn()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description?: string;

  @Field(() => [Language])
  @ManyToMany(() => Language, lang => lang.frameworks, {
    cascade: true,
  })
  @JoinTable()
  languages: Language[];

  @Field(() => [Template])
  @ManyToMany(() => Template, template => template.frameworks)
  templates: Template[];

  @Field(() => User)
  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: "creator" })
  creator: User;
}

@InputType()
export class CreateFrameworkInput {
  @Length(2, 30)
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
  logoUrl?: string;

  @Length(5)
  @Field({ nullable: true })
  description?: string;

  @MinLength(1, { each: true })
  @Field(() => [String], { nullable: true })
  languages?: string[];
}

@InputType()
export class UpdateFrameworkInput implements Partial<CreateFrameworkInput> {
  @Field()
  name: string;

  @Length(2, 30)
  @Field({ nullable: true })
  newName: string;

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
  logoUrl?: string;

  @Length(5)
  @Field({ nullable: true })
  description?: string;

  @MinLength(1, { each: true })
  @Field(() => [String], { nullable: true })
  languages?: string[];
}
