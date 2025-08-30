import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from "typeorm";
import { User } from "./user";

export enum CourseRequestStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  IMPLEMENTED = "implemented",
  DUPLICATE = "duplicate",
}

@Entity("course_requests")
export class CourseRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column("simple-array", { nullable: true })
  suggestedTags?: string[];

  @Column({
    type: "enum",
    enum: ["10-12", "13-15", "16-18"],
    nullable: true,
  })
  suggestedAgeGroup?: string;

  @Column("simple-array", { nullable: true })
  suggestedObjectives?: string[];

  @Column({ nullable: true })
  rationale?: string;

  @Column({ nullable: true })
  realWorldApplication?: string;

  @Column({
    type: "enum",
    enum: CourseRequestStatus,
    default: CourseRequestStatus.PENDING,
  })
  status!: CourseRequestStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  adminNotes?: string;

  @Column({ nullable: true })
  implementedCourseId?: string;

  @Column({ default: 0 })
  voteCount!: number;

  @ManyToOne(() => User, (user) => user.courseRequests)
  requestedBy!: User;

  @OneToMany(() => CourseRequestVote, (vote) => vote.courseRequest)
  votes!: CourseRequestVote[];

  @OneToMany(() => CourseRequestComment, (comment) => comment.courseRequest)
  comments!: CourseRequestComment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy?: User;
}

@Entity("course_request_votes")
@Unique(["user", "courseRequest"])
export class CourseRequestVote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.courseRequestVotes)
  user!: User;

  @ManyToOne(() => CourseRequest, (request) => request.votes)
  courseRequest!: CourseRequest;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity("course_request_comments")
export class CourseRequestComment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  content!: string;

  @ManyToOne(() => User, (user) => user.courseRequestComments)
  author!: User;

  @ManyToOne(() => CourseRequest, (request) => request.comments)
  courseRequest!: CourseRequest;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: false })
  isAdminComment!: boolean;
}
