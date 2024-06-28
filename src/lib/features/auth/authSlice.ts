import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import _ from "lodash";
import {
  MessageWithFolder,
  MessageWithNestedFolders,
} from "../../../models/message";
import { AppUser } from "@prisma/client";

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
  },
});

export const { setUser, setError, clearUser, setUserData, setLoadingData } =
  authSlice.actions;

export const selectAuth = (state: RootState): AuthState => state.auth;

export default authSlice.reducer;
