import { IsUrl, IsUUID, Length, MinLength } from "class-validator";
import { ArgsType, Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Language } from "./Language";
import { Template } from "./Template";
import { User } from "./User";

@Entity()
@ObjectType()
export class Library {
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

  @Field(() => Language, { nullable: true })
  @ManyToOne(() => Language, lang => lang.libraries, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  language?: Language;

  @Field(() => [Template])
  @ManyToMany(() => Template, template => template.libraries)
  templates: Template[];

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "creator" })
  creator: User;
}

@ArgsType()
export class CreateLibraryInput {
  @Length(2, 60)
  @Field()
  name: string;

  @IsUrl({
    allow_underscores: true,
    protocols: ["http", "https"],
    require_protocol: true,
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

  @MinLength(5)
  @Field({ nullable: true })
  description?: string;

  @MinLength(1)
  @Field({ nullable: true })
  language?: string;
}

@ArgsType()
export class UpdateLibraryInput implements Partial<CreateLibraryInput> {
  @IsUUID()
  @Field()
  id: string;

  @Length(2, 60)
  @Field()
  name: string;

  @IsUrl({
    allow_underscores: true,
    protocols: ["http", "https"],
    require_protocol: true,
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

  @MinLength(5)
  @Field({ nullable: true })
  description?: string;

  @MinLength(1)
  @Field({ nullable: true })
  language?: string;
}
