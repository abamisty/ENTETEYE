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
import { Child } from "./children";

@Entity("parent_profiles")
export class ParentProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ type: "varchar", nullable: true })
  educationLevel?: string;

  @Column({ type: "boolean", default: false })
  isFamilyOwner!: boolean;

  @OneToOne(() => User, (user) => user.parentProfile)
  @JoinColumn()
  user!: User;

  @ManyToOne(() => Family, (family) => family.parents)
  family!: Family;

  @OneToMany(() => Child, (child) => child.addedBy)
  addedChildren!: Child[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
