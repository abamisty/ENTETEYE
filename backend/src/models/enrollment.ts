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
import { Course, LearningPath, LearningSegment } from "./courses";
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

  @Column({ default: 0 })
  totalPointsEarned!: number;

  @Column({ type: "jsonb", nullable: true })
  preferences?: {
    difficulty?: "easy" | "medium" | "hard";
    notificationEnabled?: boolean;
    dailyGoalMinutes?: number;
  };

  @OneToMany(() => PathProgress, (progress) => progress.enrollment)
  pathProgress!: PathProgress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("path_progress")
export class PathProgress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.pathProgress)
  enrollment!: Enrollment;

  @ManyToOne(() => LearningPath, (path) => path.pathProgressRecords)
  learningPath!: LearningPath;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ nullable: true })
  completedAt!: Date;

  @Column({ default: 0 })
  progressPercentage!: number;

  @Column({ default: 0 })
  pointsEarned!: number;

  @OneToMany(() => SegmentProgress, (progress) => progress.pathProgress)
  segmentProgress!: SegmentProgress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("segment_progress")
export class SegmentProgress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => PathProgress, (progress) => progress.segmentProgress)
  pathProgress!: PathProgress;

  @ManyToOne(() => LearningSegment, (segment) => segment.progressRecords)
  segment!: LearningSegment;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ nullable: true })
  completedAt!: Date;

  @Column({ type: "jsonb", nullable: true })
  interactionData?: {
    // For dialogue segments
    dialogue?: {
      listenedFully: boolean;
      interactions: number;
    };

    question?: {
      answer: string;
      isCorrect: boolean;
      attempts: number;
    };

    practice?: {
      score: number;
      attempts: number;
      details: any;
    };
  };

  @Column({ default: 0 })
  pointsEarned!: number;

  @Column({ default: 0 })
  timeSpentSeconds!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
