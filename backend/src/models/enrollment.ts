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
import { Course, Lesson } from "./courses";
import { Child } from "./children";

@Entity("enrollments")
export class Enrollment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Child, (child) => child.enrollments)
  child!: Child;

  @ManyToOne(() => Course, (course) => course.enrollments)
  course!: Course;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ nullable: true })
  completedAt!: Date;

  @Column({ default: 0 })
  progressPercentage!: number;

  @Column({ type: "jsonb", nullable: true })
  coursePreferences?: {
    difficulty?: "easy" | "medium" | "hard";
    notificationEnabled?: boolean;
    dailyGoalMinutes?: number;
  };

  @OneToMany(() => ChildProgress, (progress) => progress.enrollment)
  progress!: ChildProgress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// child-progress.entity.ts
@Entity("child_progress")
export class ChildProgress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Child, (child) => child.progressRecords)
  child!: Child;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.progress)
  enrollment!: Enrollment;

  @ManyToOne(() => Lesson, (lesson) => lesson.progressRecords)
  lesson!: Lesson;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ nullable: true })
  completedAt!: Date;

  @Column({ type: "jsonb", nullable: true })
  quizResults?: {
    score: number;
    totalQuestions: number;
    answers: {
      questionId: string;
      selectedAnswer: string;
      isCorrect: boolean;
    }[];
  };

  @Column({ type: "jsonb", nullable: true })
  activityResults?: {
    activityType: string;
    data: any;
    pointsEarned: number;
  };

  @Column({ type: "int", default: 0 })
  timeSpentMinutes!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
