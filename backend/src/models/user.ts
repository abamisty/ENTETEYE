import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToMany,
} from "typeorm";
import { Family } from "./family";
import { ParentProfile } from "./parent";
import { AdminProfile } from "./admin";

export enum UserRole {
  PARENT = "parent",
  ADMIN = "admin",
  CHILD = "child",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
}

@Entity("users")
@Unique(["email", "phoneNumber"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50 })
  firstName!: string;

  @Column({ type: "varchar", length: 50 })
  lastName!: string;

  @Column({ type: "varchar", nullable: true })
  avatar?: string;

  @Column({ type: "enum", enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: "date", nullable: true })
  dob?: Date;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: true })
  password?: string;

  @Column({ type: "varchar", unique: true, nullable: true })
  phoneNumber?: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified!: boolean;

  @Column({ type: "varchar", nullable: true })
  emailVerificationCode?: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerificationExp?: Date;

  @Column({ type: "boolean", default: false })
  isPhoneVerified!: boolean;

  @Column({ type: "varchar", nullable: true })
  phoneVerificationCode?: string;

  @Column({ type: "timestamp", nullable: true })
  phoneVerificationExp?: Date;

  @Column({ type: "varchar", nullable: true })
  resetPasswordToken?: string;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExp?: Date;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.PARENT,
  })
  role!: UserRole;

  @OneToOne(() => ParentProfile, (profile) => profile.user, { nullable: true })
  parentProfile?: ParentProfile;

  @OneToOne(() => AdminProfile, (profile) => profile.user, { nullable: true })
  adminProfile?: AdminProfile;

  @ManyToOne(() => Family, (family) => family.parents, { nullable: true })
  family?: Family;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
