import axios from "axios";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  MessageWithFolder,
  MessageWithNestedFolders,
} from "../../models/message";
import {
  selectAuth,
  setLoadingData,
  setUserData,
} from "../features/auth/authSlice";
import { Folder, Message } from "@prisma/client";

export default function useMessage() {
  const { isDataFetched, loadingData, data } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const getMessagesData = async () => {
    if (isDataFetched || loadingData) {
      return;
    }
    dispatch(setLoadingData(true));
    const response =
      await axios.get<MessageWithNestedFolders[]>("api/user/data");
    const data: MessageWithFolder[] = response.data.map(
      messageWithNestedFolder => {
        const folder = messageWithNestedFolder.messagesInFolder.filter(
          mif => mif.messageId === messageWithNestedFolder.id,
        )?.[0]?.folder;

        let folderNoCreatedAt: Omit<Folder, "createdAt"> | null = null;
        if (folder) {
          const { createdAt: createdAtFolder, ...rest } = folder;
          folderNoCreatedAt = rest;
        }

        const { messagesInFolder, ...message } = messageWithNestedFolder;
        const { createdAt: createdAtMessage, ...messageNoCreatedAt } = message;

        return {
          ...message,
          folder: folderNoCreatedAt,
        };
      },
    );

    dispatch(setUserData(data));
  };

  const updateMessage = async (message: Partial<Message>, id: string) => {
    // api/messages patch
    const oldData = [...data];
    const optimisticUpdate = (message: Partial<Message>) => {
      const newData = data.map(d => (d.id === id ? { ...d, ...message } : d));
      dispatch(setUserData(newData));
    };
    optimisticUpdate(message);
    try {
      await axios.patch(`api/messages`, { ...message, id });
    } catch (error: any) {
      console.error(error);
      dispatch(setUserData(oldData));
      throw error;
    }
  };

  return { getMessagesData, updateMessage };
}
