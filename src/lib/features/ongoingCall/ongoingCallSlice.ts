import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { OngoingCall } from "@prisma/client";

interface OngoingCallState {
  ongoingCall: Partial<OngoingCall> | undefined;
}

export const initialState: OngoingCallState = {
  ongoingCall: undefined,
};

const ongoingCallSlice = createSlice({
  name: "ongoingCall",
  initialState,
  reducers: {
    setOngoingCall: (
      state,
      action: PayloadAction<Partial<OngoingCall> | undefined>,
    ) => {
      state.ongoingCall = action.payload;
    },
  },
});

export const { setOngoingCall } = ongoingCallSlice.actions;

export const selectOngoingCall = (state: RootState): OngoingCallState =>
  state.ongoingCall;

export default ongoingCallSlice.reducer;
