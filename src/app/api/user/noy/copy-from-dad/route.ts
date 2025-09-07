import prisma from "@/app/api/_db/db";
import { authOptions } from "@/auth/authOptions";
import { MessageInFolder } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const dadId = "aec62020-877f-4f18-b9c2-3d767791d46b";
const noyId = "f7b10db2-657b-4784-946e-cb91d57b36ce";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const idToCopyTo = session?.user?.userId || noyId;

  const dadMessages = await prisma.message.findMany({
    where: {
      userId: dadId,
      isActive: true,
    },
  });

  const dadFolders = await prisma.folder.findMany({
    where: {
      userId: dadId,
      isActive: true,
    },
  });

  const messagesInFolders = await prisma.messageInFolder.findMany();

  // build a folder name to messages body map
  const folderNameToMessagesBodyMap = new Map<string, string[]>();
  for (const message of dadMessages) {
    const messageInFolder = messagesInFolders.find(
      messageInFolder => messageInFolder.messageId === message.id,
    );
    if (messageInFolder) {
      const folderName = dadFolders.find(
        folder => folder.id === messageInFolder.folderId,
      )?.title;
      if (folderName?.includes("קרנות")) {
        console.log(message.body);
      }
      if (folderName) {
        folderNameToMessagesBodyMap.set(folderName, [
          ...(folderNameToMessagesBodyMap.get(folderName) || []),
          message.body,
        ]);
      }
    }
  }

  // delete all noys messages and folders, copy dad's folders and messages to noy, as well as the messages in folders

  const noyMessages = await prisma.message.findMany({
    where: {
      userId: idToCopyTo,
    },
  });
  const noyFolders = await prisma.folder.findMany({
    where: {
      userId: idToCopyTo,
    },
  });

  const noyNewMessagesNoId = dadMessages.map(message => {
    const { id, ...rest } = message;

    return {
      ...rest,
      userId: idToCopyTo,
    };
  });

  const noyNewFoldersNoId = dadFolders.map(folder => {
    const { id, ...rest } = folder;
    return {
      ...rest,
      userId: idToCopyTo,
    };
  });

  const noyMessageInFolders = await prisma.messageInFolder.findMany({
    where: {
      OR: [
        {
          messageId: {
            in: noyMessages.map(message => message.id),
          },
        },
        {
          folderId: {
            in: noyFolders.map(folder => folder.id),
          },
        },
      ],
    },
  });

  // delete all noy's message in folders
  await prisma.messageInFolder.deleteMany({
    where: {
      id: {
        in: noyMessageInFolders.map(messageInFolder => messageInFolder.id),
      },
    },
  });

  try {
    await prisma.$transaction(async tx => {
      await tx.folder.deleteMany({
        where: {
          userId: idToCopyTo,
        },
      });

      await tx.message.deleteMany({
        where: {
          userId: idToCopyTo,
        },
      });

      await tx.message.createMany({
        data: noyNewMessagesNoId,
      });

      await tx.folder.createMany({
        data: noyNewFoldersNoId,
      });
    });

    const messagesCreated = await prisma.message.findMany({
      where: {
        userId: idToCopyTo,
      },
    });

    const foldersCreated = await prisma.folder.findMany({
      where: {
        userId: idToCopyTo,
      },
    });

    const messagesInFolders: Omit<MessageInFolder, "id">[] = [];
    for (const folder of foldersCreated) {
      const messagesBodies = folderNameToMessagesBodyMap.get(folder.title);
      const messages = messagesCreated.filter(m =>
        messagesBodies?.includes(m.body),
      );

      for (const message of messages) {
        messagesInFolders.push({
          messageId: message.id,
          folderId: folder.id,
          isActive: true,
          createdAt: new Date(),
          userIdMessage: idToCopyTo,
          userIdFolder: idToCopyTo,
        });
      }
    }
    await prisma.messageInFolder.createMany({
      data: messagesInFolders,
    });
  } catch (e) {
    console.error(e);
    await prisma.messageInFolder.createMany({
      data: noyMessageInFolders,
    });
    return NextResponse.json(
      { error: "Failed to copy messages" },
      { status: 500 },
    );
  }
  return NextResponse.json({ message: "Messages copied" });
}
