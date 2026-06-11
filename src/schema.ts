import { z } from "zod";

export enum DeviceStatus {
  COMMUNITY = "COMMUNITY",
  OFFICIAL = "OFFICIAL",
}

export const DeviceStatusEnum = z.nativeEnum(DeviceStatus);

export enum SELinuxStatus {
  Enforcing = "Enforcing",
  Permissive = "Permissive",
}

export const SELinuxStatusEnum = z.nativeEnum(SELinuxStatus);

export enum TaskStatus {
  TODO = "TODO",
  DOING = "DOING",
  DONE = "DONE",
  FAILED = "FAILED",
}

export const TaskStatusEnum = z.nativeEnum(TaskStatus);

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export const UserRoleEnum = z.nativeEnum(UserRole);

export const DeviceSchema = z.object({
  id: z.string(),
  codename: z.string(),
  name: z.string(),
  version: z.string(),
  androidVersion: z.number(),
  status: DeviceStatusEnum,
  selinuxStatus: SELinuxStatusEnum,
  kernelsuVersion: z.number(),
  sourcforgeUrl: z.string(),
  changelog: z.string().nullable(),
  note: z.string().nullable(),
  publishAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Device = z.infer<typeof DeviceSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  status: TaskStatusEnum,
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Task = z.infer<typeof TaskSchema>;

export const ContextSchema = z.object({
  id: z.string(),
  index: z.number(),
  content: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Context = z.infer<typeof ContextSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  role: UserRoleEnum,
  banned: z.boolean(),
  banReason: z.string().nullable(),
  banExpires: z.number().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  impersonatedBy: z.string(),
  expiresAt: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  accessTokenExpiresAt: z.string().nullable(),
  refreshTokenExpiresAt: z.string().nullable(),
  scope: z.string().nullable(),
  idToken: z.string().nullable(),
  password: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Account = z.infer<typeof AccountSchema>;

export const VerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Verification = z.infer<typeof VerificationSchema>;
