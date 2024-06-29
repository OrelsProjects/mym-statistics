import axios from "axios";
import { useAppDispatch, useAppSelector } from "./redux";
import { selectAuth, setFolders } from "../features/auth/authSlice";
import { Folder } from "@prisma/client";
import { CreateFolder, FolderNoCreatedAt } from "../../models/folder";

export default function useFolder() {
  const { folders } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const updateFolder = async (folder: Partial<Folder>, folderId: string) => {
    // api/messages patch
    const oldData = [...folders];
    const optimisticUpdate = (folder: Partial<Folder>) => {
      const newData = folders.map(folder =>
        folder.id === folderId ? { ...folder } : folder,
      );
      dispatch(setFolders(newData));
    };
    optimisticUpdate(folder);
    try {
      await axios.patch(`api/folders`, { folder, folderId });
    } catch (error: any) {
      console.error(error);
      dispatch(setFolders(oldData));
      throw error;
    }
  };

  const createFolder = async (folder: CreateFolder) => {
    const oldData = [...folders];
    const optimisticCreate = (folder: CreateFolder) => {
      const folderNoCreatedAt: FolderNoCreatedAt = {
        ...folder,
        isActive: true,
        timesUsed: 0,
        userId: "temp",
        id: "temp",
      };
      const newData = [...folders, { ...folderNoCreatedAt }];
      dispatch(setFolders(newData));
    };
    optimisticCreate(folder);
    try {
      const response = await axios.post<Folder>(`api/folders`, {
        folder,
      });
      const newData = folders.filter(folder => folder.id !== "temp");

      dispatch(setFolders([...newData, response.data]));
    } catch (error: any) {
      console.error(error);
      dispatch(setFolders(oldData));
      throw error;
    }
  };

  const deleteFolder = async (folderId: string) => {
    const oldData = [...folders];
    const optimisticDelete = () => {
      const newData = folders.filter(folder => folder.id !== folderId);
      dispatch(setFolders(newData));
    };
    optimisticDelete();
    try {
      await axios.delete(`api/folders/${folderId}`);
    } catch (error: any) {
      console.error(error);
      dispatch(setFolders(oldData));
      throw error;
    }
  };

  return { updateFolder, createFolder, deleteFolder };
}
