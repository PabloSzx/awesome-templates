import { IsUrl, IsUUID, Length } from "class-validator";
import { ArgsType, Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Template } from "./Template";
import { User } from "./User";

@Entity()
@ObjectType()
export class Environment {
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

  @Field(() => [Template])
  @ManyToMany(() => Template, template => template.environments)
  templates: Template[];

  @Field(() => User)
  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: "creator" })
  creator: User;
}

@ArgsType()
export class CreateEnvironmentInput {
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
}

@ArgsType()
export class UpdateEnvironmentInput implements Partial<CreateEnvironmentInput> {
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
}
