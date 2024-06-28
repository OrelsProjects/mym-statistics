import { Folder, Message, MessageInFolder } from "@prisma/client";

export type MessageWithNestedFolders = Message & {
  messagesInFolder: (MessageInFolder & {
    folder: Folder | null;
  })[];
};

export type MessageWithFolder = Omit<Message, "createdAt"> & {
  folder: Omit<Folder, "createdAt"> | null;
};
