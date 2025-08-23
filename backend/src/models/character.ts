import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./user";
import { Course } from "./courses";

@Entity("characters")
export class Character {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column("text")
  description!: string;

  @Column()
  avatarUrl!: string;

  @Column({
    type: "enum",
    enum: ["human", "animal", "fantasy", "robot", "historical"],
    default: "human",
  })
  type!: string;

  @Column({
    type: "enum",
    enum: ["child", "teen", "adult", "elder"],
    default: "adult",
  })
  ageGroup!: string;

  @Column("simple-array", { nullable: true })
  personalityTraits!: string[];

  @Column("jsonb", { nullable: true })
  voiceSettings?: {
    pitch: number;
    speed: number;
    tone: string;
  };

  @Column("jsonb", { nullable: true })
  visualCustomization?: {
    colorScheme: string;
    outfit: string;
    accessories: string[];
  };

  @ManyToMany(() => Course, (course) => course.featuredCharacters)
  @JoinTable()
  availableInCourses!: Course[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
