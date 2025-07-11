import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./user";
import { FamilySubscription } from "./subscription";
import { Child } from "./children";
import { ParentProfile } from "./parent";

@Entity("families")
export class Family {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  familyCode!: string;

  @ManyToOne(() => User, (user) => user.parentProfile)
  owner!: User;

  @ManyToMany(() => User, (user) => user.family)
  @JoinTable()
  parents!: User[];

  @OneToMany(() => Child, (child) => child.family)
  children!: Child[];

  @OneToMany(() => FamilySubscription, (sub) => sub.family)
  subscriptions!: FamilySubscription[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
