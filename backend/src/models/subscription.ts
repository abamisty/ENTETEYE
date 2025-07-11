import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Family } from "./family";
import { User } from "./user";

export enum SubscriptionPlan {
  MONTHLY = "monthly",
  YEARLY = "yearly",
  LIFETIME = "lifetime",
}

export enum SubscriptionStatus {
  TRIAL = "trial",
  ACTIVE = "active",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

@Entity("family_subscriptions")
export class FamilySubscription {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  paystackSubscriptionCode!: string;

  @Column({ unique: true, nullable: true })
  paystackCustomerCode?: string;

  @Column({ nullable: true })
  paystackEmailToken?: string;

  @Column({ type: "enum", enum: SubscriptionPlan })
  plan!: SubscriptionPlan;

  @Column({
    type: "enum",
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status!: SubscriptionStatus;

  @Column({ type: "timestamp" })
  startDate!: Date;

  @Column({ type: "timestamp", nullable: true })
  endDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  nextPaymentDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  trialEndDate?: Date;

  @Column({ type: "int" })
  amount!: number;

  @Column({ default: "NGN" })
  currency!: string;

  @Column({ default: false })
  isAutoRenew!: boolean;

  @ManyToOne(() => Family, (family) => family.subscriptions)
  @JoinColumn()
  family!: Family;

  @ManyToOne(() => User)
  @JoinColumn()
  managedBy!: User;

  @OneToMany(() => SubscriptionPayment, (payment) => payment.subscription)
  payments!: SubscriptionPayment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity("subscription_payments")
export class SubscriptionPayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  paystackReference!: string;

  @Column()
  paystackAuthorizationCode!: string;

  @Column({ type: "int" })
  amount!: number;

  @Column({ type: "timestamp" })
  paidAt!: Date;

  @Column({ type: "enum", enum: ["success", "failed", "pending"] })
  status!: "success" | "failed" | "pending";

  @Column({ type: "jsonb", nullable: true })
  metadata?: any;

  @ManyToOne(() => FamilySubscription, (sub) => sub.payments)
  @JoinColumn()
  subscription!: FamilySubscription;

  @ManyToOne(() => User)
  @JoinColumn()
  initiatedBy!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
