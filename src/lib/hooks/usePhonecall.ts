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

  async function sendWhatsapp(phoneNumber: string, body: string) {
    try {
      let formattedNumber = phoneNumber.replace(/\D/g, "");
      if (formattedNumber.startsWith("0")) {
        formattedNumber = `+972${formattedNumber.slice(1)}`;
      }
      const encodedMessage = encodeURIComponent(body);
      const url = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error sending whatsapp", error);
      throw error;
    }
  }

  return { ongoingCall, loading, getLatestOngoingCall, sendWhatsapp };
}
