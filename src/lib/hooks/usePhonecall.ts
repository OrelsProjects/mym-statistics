import { OngoingCall } from "@prisma/client";
import axios from "axios";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  selectOngoingCall,
  setOngoingCall,
} from "../features/ongoingCall/ongoingCallSlice";

export default function usePhonecall() {
  const dispatch = useAppDispatch();
  const { ongoingCall } = useAppSelector(selectOngoingCall);

  const [loading, setLoading] = useState(false);

  async function getLatestOngoingCall() {
    if (loading) return;
    try {
      setLoading(true);
      const result = await axios.get<{
        diff: number;
        ongoingCall?: Partial<OngoingCall>;
      }>("/api/ongoing-call/latest");
      dispatch(setOngoingCall(result.data.ongoingCall));
    } catch (error) {
      console.error("Error getting latest ongoing call", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { ongoingCall, loading, getLatestOngoingCall };
}
