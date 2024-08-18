import { Folder, Message, MessageInFolder } from "@prisma/client";
import { FolderNoCreatedAt } from "./folder";

export type MessageWithNestedFolders = Message & {
  messagesInFolder: (MessageInFolder & {
    folder: Folder | null;
  })[];
};

export type MessageNoCreatedAt = Omit<Message, "createdAt">;

export type CreateMessage = Omit<
Message,
"id" | "createdAt" | "userId" | "timesUsed" | "isActive"
>;

export type MessageWithFolder = MessageNoCreatedAt & {
  folder: FolderNoCreatedAt | null;
};
