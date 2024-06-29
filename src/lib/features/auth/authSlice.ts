import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import _ from "lodash";
import { MessageWithFolder } from "../../../models/message";
import { AppUser, Folder } from "@prisma/client";
import { FolderNoCreatedAt } from "../../../models/folder";

export type AuthStateType =
  | "anonymous"
  | "authenticated"
  | "unauthenticated"
  | "registration_required";

export interface AuthState {
  user?: AppUser | null;
  isAdmin: boolean;
  state: AuthStateType;
  loading: boolean;
  loadingData?: boolean;
  error: string | null;
  data: MessageWithFolder[];
  folders: FolderNoCreatedAt[];
  isDataFetched?: boolean;
}

export const initialState: AuthState = {
  user: null,
  isAdmin: false,
  state: "unauthenticated",
  loading: true,
  loadingData: false,
  error: null,
  data: [],
  folders: [],
  isDataFetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<
        ((AppUser | undefined) & { state?: AuthStateType }) | null | undefined
      >,
    ) => {
      state.loading = false;
      if (!action.payload) {
        state.user = null;
        state.state = "unauthenticated";
        return;
      }
      const { state: authState, ...user } = action.payload;
      if (user && !_.isEqual(state.user, user)) {
        state.user = user;
      }
      state.state = action.payload.state ?? "authenticated";
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.error(action.payload);
      state.error = action.payload;
      state.loading = false;
    },
    clearUser: state => {
      state.loading = false;
      state.user = null;
      state.state = "unauthenticated";
    },
    setLoadingData: (state, action: PayloadAction<boolean>) => {
      state.loadingData = action.payload;
    },
    setUserData: (state, action: PayloadAction<MessageWithFolder[]>) => {
      state.data = action.payload;
      state.isDataFetched = true;
      state.loadingData = false;
    },
    setFolders: (state, action: PayloadAction<FolderNoCreatedAt[]>) => {
      state.folders = action.payload;
    },
    updateFolder: (
      state,
      action: PayloadAction<{ folderId: string; folder: FolderNoCreatedAt }>,
    ) => {
      state.folders = state.folders.map(folder =>
        folder.id === action.payload.folderId
          ? { ...folder, ...action.payload.folder }
          : folder,
      );
      state.data = state.data.map(message =>
        message.folder?.id === action.payload.folderId
          ? { ...message, folder: action.payload.folder }
          : message,
      );
    },
  },
});

export const {
  setUser,
  setError,
  clearUser,
  setUserData,
  setLoadingData,
  setFolders,
} = authSlice.actions;

export const selectAuth = (state: RootState): AuthState => state.auth;

export default authSlice.reducer;
