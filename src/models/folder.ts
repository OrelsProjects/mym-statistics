import { Folder } from "@prisma/client";

export type FolderNoCreatedAt = Omit<Folder, "createdAt">;

export type CreateFolder = Omit<
  Folder,
  "id" | "createdAt" | "userId" | "timesUsed" | "isActive"
>;