import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { OngoingCall } from "@prisma/client";

interface OngoingCallState {
  ongoingCall: Partial<OngoingCall> | undefined;
  loading: boolean;
  isInit: boolean;
}

export const initialState: OngoingCallState = {
  ongoingCall: undefined,
  loading: false,
  isInit: false,
};

const ongoingCallSlice = createSlice({
  name: "ongoingCall",
  initialState,
  reducers: {
    setOngoingCall: (
      state,
      action: PayloadAction<Partial<OngoingCall> | undefined>,
    ) => {
      state.isInit = true;
      state.ongoingCall = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setIsInit: (state, action: PayloadAction<boolean>) => {
      state.isInit = action.payload;
    },
  },
});

export const { setOngoingCall, setLoading, setIsInit } =
  ongoingCallSlice.actions;

export const selectOngoingCall = (state: RootState): OngoingCallState =>
  state.ongoingCall;

export default ongoingCallSlice.reducer;
