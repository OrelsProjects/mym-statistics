import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import ongoingCallReducer from "./features/ongoingCall/ongoingCallSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ongoingCall: ongoingCallReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
