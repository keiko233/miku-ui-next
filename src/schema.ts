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

// not need zod schema
export interface Database {
  Devices: Device;
  Tasks: Task;
  Context: Context;
}
