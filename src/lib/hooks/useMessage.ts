import axios from "axios";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  CreateMessage,
  MessageNoCreatedAt,
  MessageWithFolder,
  MessageWithNestedFolders,
} from "../../models/message";
import {
  selectAuth,
  setFolders,
  setLoadingData,
  setUserData,
} from "../features/auth/authSlice";
import { Folder, Message } from "@prisma/client";

export default function useMessage() {
  const { isDataFetched, loadingData, data, folders } =
    useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const getMessagesData = async () => {
    if (isDataFetched || loadingData) {
      return;
    }
    dispatch(setLoadingData(true));
    try {
      const response = await axios.get<{
        data: MessageWithNestedFolders[];
        folders: Folder[];
      }>("api/user/data");

      const data: MessageWithFolder[] = response.data.data.map(
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
          const { createdAt: createdAtMessage, ...messageNoCreatedAt } =
            message;

          return {
            ...message,
            folder: folderNoCreatedAt,
          };
        },
      );

      dispatch(setUserData(data));
      dispatch(setFolders(response.data.folders));
    } catch (error: any) {
      console.error(error);
    } finally {
      dispatch(setLoadingData(false));
    }
  };

  const updateMessage = async (
    message: Partial<Message>,
    messageId: string,
    folderId: string,
    oldFolderId?: string,
  ) => {
    // api/messages patch
    const oldData = [...data];
    const optimisticUpdate = (message: Partial<Message>) => {
      const newFolder = folders.find(folder => folder.id === folderId) || null;
      const newData = data.map(d =>
        d.id === messageId ? { ...d, ...message, folder: newFolder } : d,
      );
      dispatch(setUserData(newData));
    };
    optimisticUpdate(message);
    try {
      await axios.patch(`api/messages`, {
        message,
        messageId,
        folderId,
        oldFolderId,
      });
    } catch (error: any) {
      console.error(error);
      dispatch(setUserData(oldData));
      throw error;
    }
  };

  const createMessage = async (message: CreateMessage, folderId: string) => {
    const oldData = [...data];
    const folder = folders.find(folder => folder?.id === folderId) || null;
    const optimisticCreate = (message: CreateMessage) => {
      const messageNoCreatedAt: MessageNoCreatedAt = {
        ...message,
        isActive: true,
        timesUsed: 0,
        userId: "temp",
        id: "temp",
      };
      const newData = [...data, { ...messageNoCreatedAt, folder }];
      dispatch(setUserData(newData));
    };
    optimisticCreate(message);
    try {
      const response = await axios.post<Message>(`api/messages`, {
        message,
        folderId,
      });
      const newMessageData: MessageWithFolder = { ...response.data, folder };
      const newData = data.filter(d => d.id !== "temp");

      dispatch(setUserData([...newData, newMessageData]));
    } catch (error: any) {
      console.error(error);
      dispatch(setUserData(oldData));
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    const oldData = [...data];
    const optimisticDelete = () => {
      const newData = data.filter(d => d.id !== messageId);
      dispatch(setUserData(newData));
    };
    optimisticDelete();
    try {
      await axios.delete(`api/messages/${messageId}`);
    } catch (error: any) {
      console.error(error);
      dispatch(setUserData(oldData));
      throw error;
    }
  };

  return { getMessagesData, updateMessage, createMessage, deleteMessage };
}
