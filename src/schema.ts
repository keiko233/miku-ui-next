export enum DeviceStatus {
  COMMUNITY = "COMMUNITY",
  OFFICIAL = "OFFICIAL",
}

export enum SELinuxStatus {
  Enforcing = "Enforcing",
  Permissive = "Permissive",
}

export enum TaskStatus {
  TODO = "TODO",
  DOING = "DOING",
  DONE = "DONE",
  FAILED = "FAILED",
}

export interface Device {
  id: string;
  codename: string;
  name: string;
  version: string;
  androidVersion: number;
  status: DeviceStatus;
  selinuxStatus: SELinuxStatus;
  kernelsuVersion: number;
  sourcforgeUrl: string;
  changelog: string | null;
  note: string | null;
  publishAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  content: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Database {
  Devices: Device;
  Tasks: Task;
}
