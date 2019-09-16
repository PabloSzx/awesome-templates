import { IsUrl, IsUUID, Length, MinLength } from "class-validator";
import { ArgsType, Field, ID, ObjectType } from "type-graphql";
import {
    Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn
} from "typeorm";

import { Language } from "./Language";
import { Template } from "./Template";
import { User } from "./User";

@Entity()
@ObjectType()
export class Framework {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ unique: true })
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

@ArgsType()
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

@ArgsType()
export class UpdateFrameworkInput implements Partial<CreateFrameworkInput> {
  @IsUUID()
  @Field()
  id: string;

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
