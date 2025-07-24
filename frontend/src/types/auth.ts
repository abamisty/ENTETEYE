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

export interface BaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  gender?: Gender;
  role: UserRole;
}

export interface ParentAdminUser extends BaseUser {
  role: UserRole.PARENT | UserRole.ADMIN;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  parentProfile?: ParentProfile;
  adminProfile?: AdminProfile;
  family?: Family;
  username?: string;
}

export interface ChildUser {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
  family: Family;
  role: UserRole.CHILD;
  learningPreferences?: {
    difficulty: "easy" | "medium" | "hard";
    favoriteSubjects: string[];
  };
  totalPoints: number;
  currentStreak: number;
}

export type AppUser = ParentAdminUser | ChildUser;

export interface AuthState {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ParentProfile {
  // Add parent profile fields as needed
}

export interface AdminProfile {
  permissions: string[];
}

export interface Family {
  // Add family fields as needed
}
