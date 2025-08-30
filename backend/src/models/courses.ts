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
import { Character } from "./character";
import { Enrollment, PathProgress, SegmentProgress } from "./enrollment";

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

  @OneToMany(() => LearningPath, (path) => path.course)
  learningPaths!: LearningPath[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments!: Enrollment[];

  @ManyToMany(() => Character, (character) => character.availableInCourses)
  @JoinTable()
  featuredCharacters!: Character[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("learning_paths")
export class LearningPath {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column()
  order!: number;

  @OneToMany(() => PathProgress, (progress) => progress.learningPath)
  pathProgressRecords!: PathProgress[];

  @ManyToOne(() => Course, (course) => course.learningPaths)
  course!: Course;

  @OneToMany(() => LearningSegment, (segment) => segment.learningPath)
  segments!: LearningSegment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("learning_segments")
export class LearningSegment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  order!: number;

  @Column({
    type: "enum",
    enum: [
      "dialogue",
      "instruction",
      "question",
      "practice",
      "review",
      "scenario",
      "flashcards",
      "matching",
      "storytelling",
      "dragdrop",
      "dragwords",
      "fillblanks",
      "questionset",
    ],
    default: "instruction",
  })
  type!: string;

  @Column("int", { default: 0 })
  basePoints!: number;

  @Column("int", { nullable: true })
  bonusPoints?: number;

  @Column("jsonb", { nullable: true })
  content?: {
    dialogue?: {
      characters: Array<{
        characterId: string;
        lines: string[];
        position: "left" | "right" | "center";
      }>;
      backgroundScene?: string;
      audioUrl?: string;
    };

    instruction?: {
      text: string;
      mediaUrl?: string;
      mediaType?: "image" | "video" | "audio";
    };
    question?: {
      text: string;
      type: "multiple-choice" | "true-false" | "fill-blank" | "matching";
      options?: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
      }>;
      correctAnswer?: string;
      explanation?: string;
    };
    practice?: {
      type: "drag-drop" | "role-play" | "simulation";
      instructions: string;
      components: any;
    };
  };

  @ManyToOne(() => LearningPath, (path) => path.segments)
  learningPath!: LearningPath;

  @OneToMany(() => SegmentProgress, (progress) => progress.segment)
  progressRecords!: SegmentProgress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
