import { OngoingCall } from "@prisma/client";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  selectOngoingCall,
  setIsInit,
  setLoading,
  setOngoingCall,
} from "../features/ongoingCall/ongoingCallSlice";

export default function usePhonecall() {
  const dispatch = useAppDispatch();
  const { ongoingCall, loading } = useAppSelector(selectOngoingCall);

  async function getLatestOngoingCall() {
    if (loading) return;
    try {
      dispatch(setLoading(true));
      const result = await axios.get<{
        diff: number;
        ongoingCall?: Partial<OngoingCall>;
      }>("/api/ongoing-call/latest");
      dispatch(setOngoingCall(result.data.ongoingCall));
    } catch (error) {
      console.error("Error getting latest ongoing call", error);
      throw error;
    } finally {
      dispatch(setLoading(false));
      dispatch(setIsInit(true));
    }
  }

  async function sendWhatsapp(phoneNumber: string, body: string) {
    try {
      let formattedNumber = phoneNumber.replace(/\D/g, "");
      if (formattedNumber.startsWith("0")) {
        formattedNumber = `+972${formattedNumber.slice(1)}`;
      }
      const encodedMessage = encodeURIComponent(body);
      const url = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error sending whatsapp", error);
      throw error;
    }
  }

  function updateOngoingCall(call: Partial<OngoingCall>) {
    dispatch(setOngoingCall(call));
  }

  return {
    loading,
    ongoingCall,
    getLatestOngoingCall,
    updateOngoingCall,
    sendWhatsapp,
  };
}
