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
} from "typeorm";
import { Family } from "./family";
import { User } from "./user";
import { ParentProfile } from "./parent";

@Entity("children")
export class Child {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string; // Hashed auto-generated password

  // ===== Profile Info =====
  @Column()
  displayName!: string; // Parent-assigned (e.g., "Emma")

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
  };

  @Column({ type: "int", default: 0 })
  totalPoints!: number;

  @Column({ type: "int", default: 0 })
  currentStreak!: number;

  @ManyToOne(() => Family, (family) => family.children)
  family!: Family;

  @ManyToOne(() => ParentProfile, (parent) => parent.addedChildren)
  addedBy!: ParentProfile;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
