import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Family } from "./family";
import { ParentProfile } from "./parent";
import { User } from "./user";

@Entity("admin_profiles")
export class AdminProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text", { array: true, default: "{}" })
  permissions!: string[];

  @OneToOne(() => User, (user) => user.adminProfile)
  @JoinColumn()
  user!: User;
}
