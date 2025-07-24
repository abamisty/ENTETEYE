import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  BeforeInsert,
} from "typeorm";
import { Family } from "./family";
import { User } from "./user";
import { ParentProfile } from "./parent";
import { ChildProgress, Enrollment } from "./enrollment";
import bcrypt from "bcryptjs";

@Entity("children")
export class Child {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: false })
  password!: string;

  @Column()
  displayName!: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: "date" })
  birthDate!: Date;

  @Column({ type: "enum", enum: ["Male", "Female", "Other"] })
  gender!: "Male" | "Female" | "Other";

  @Column({ type: "jsonb", nullable: true })
  learningPreferences?: {
    difficulty: "easy" | "medium" | "hard";
    favoriteSubjects: string[];
    learningStyle?: "visual" | "auditory" | "kinesthetic";
  };

  @Column({ type: "int", default: 0 })
  totalPoints!: number;

  @Column({ type: "int", default: 0 })
  currentStreak!: number;

  @Column({ type: "jsonb", nullable: true })
  unlockedAvatars?: string[];

  @Column({ type: "jsonb", nullable: true })
  earnedBadges?: {
    badgeId: string;
    badgeName: string;
    dateEarned: Date;
    courseId?: string;
  }[];

  @ManyToOne(() => Family, (family) => family.children)
  family!: Family;

  @ManyToOne(() => ParentProfile, (parent) => parent.addedChildren)
  addedBy!: ParentProfile;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.child)
  enrollments!: Enrollment[];

  @OneToMany(() => ChildProgress, (progress) => progress.child)
  progressRecords!: ChildProgress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}
