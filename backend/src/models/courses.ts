import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user";
import { ChildProgress, Enrollment } from "./enrollment";

@Entity("courses")
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column("simple-array")
  tags!: string[];

  @Column({
    type: "enum",
    enum: ["10-12", "13-15", "16-18"],
  })
  ageGroup!: string;

  @Column("simple-array")
  learningObjectives!: string[];

  @Column()
  thumbnailUrl!: string;

  @Column({ default: false })
  isCustom!: boolean;

  @Column({ nullable: true })
  customRequestId?: string;

  @Column({ default: false })
  isApproved!: boolean;

  @OneToMany(() => Module, (module) => module.course)
  modules!: Module[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments!: Enrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("modules")
export class Module {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column()
  order!: number;

  @ManyToOne(() => Course, (course) => course.modules)
  course!: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.module)
  lessons!: Lesson[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("lessons")
export class Lesson {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column()
  order!: number;

  @Column({
    type: "enum",
    enum: [
      "video",
      "interactive",
      "quiz",
      "reading",
      "activity",
      "reflection",
      "simulation",
    ],
  })
  type!: string;

  @Column({ nullable: true })
  durationMinutes!: number;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ type: "simple-array", nullable: true })
  learningObjectives?: string[];

  @Column({ type: "int", default: 0 })
  pointsReward!: number;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  videoTranscript?: string;

  @Column({ type: "boolean", default: false })
  hasCaptions!: boolean;

  @Column("jsonb", { nullable: true })
  quiz?: {
    questions: Array<{
      id: string;
      questionText: string;
      questionType:
        | "multiple-choice"
        | "true-false"
        | "matching"
        | "short-answer";
      options?: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
      }>;
      correctAnswer?: string;
      points: number;
      explanation?: string;
    }>;
    passingScore?: number;
    maxAttempts?: number;
    timeLimitMinutes?: number;
  };

  @Column("text", { nullable: true })
  readingContent?: string;

  @Column("simple-array", { nullable: true })
  relatedResources?: string[];

  @Column("jsonb", { nullable: true })
  activity?: {
    type: "drag-drop" | "role-play" | "simulation" | "creative";
    instructions: string;
    components: any;
    scoringRubric?: any;
  };

  @Column("jsonb", { nullable: true })
  reflectionPrompts?: Array<{
    prompt: string;
    type: "text" | "audio" | "drawing";
    minLength?: number;
    maxLength?: number;
  }>;

  @Column("jsonb", { nullable: true })
  content!: any;

  @ManyToOne(() => Module, (module) => module.lessons)
  module!: Module;

  @OneToMany(() => ChildProgress, (progress) => progress.lesson)
  progressRecords!: ChildProgress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  lastUpdatedBy?: string;
}
