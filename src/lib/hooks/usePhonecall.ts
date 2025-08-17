"use client";

import { OngoingCall } from "@prisma/client";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  selectOngoingCall,
  setIsInit,
  setLoading,
  setOngoingCall,
} from "../features/ongoingCall/ongoingCallSlice";
import { db } from "@/../firebase.config";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { selectAuth } from "@/lib/features/auth/authSlice";
import { useEffect, useRef } from "react";
import { Logger } from "../../logger";

export default function usePhonecall() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { ongoingCall, loading } = useAppSelector(selectOngoingCall);
  const userRef = useRef(user); // For when the user changes tabs, when the user returns, the user is null in redux.

  useEffect(() => {
    if (user) {
      userRef.current = user;
    }
  }, [user]);

  async function getLatestOngoingCall() {
    if (loading) return;
    try {
      if (!db || !userRef.current) {
        Logger.error("DB or user is not defined");
        return;
      }
      dispatch(setLoading(true));
      const phoneCallDocRef = doc(
        db,
        "users",
        userRef.current.id,
        "ongoingCalls",
        "latest",
      );
      const result = await getDoc(phoneCallDocRef);
      if (!result.exists()) {
        dispatch(setOngoingCall(undefined));
        return;
      }
      const ongoingCall = result.data() as OngoingCall;
      dispatch(setOngoingCall(ongoingCall));
      return ongoingCall;
    } catch (error) {
      console.error("Error getting latest ongoing call", error);
      throw error;
    } finally {
      dispatch(setLoading(false));
      dispatch(setIsInit(true));
    }
  }

  async function clearLatestOngoingCall() {
    if (loading) return;
    try {
      if (!db || !userRef.current) {
        Logger.error("DB or user is not defined");
        return;
      }
      dispatch(setLoading(true));
      const phoneCallDocRef = doc(
        db,
        "users",
        userRef.current.id,
        "ongoingCalls",
        "latest",
      );
      await deleteDoc(phoneCallDocRef);
      dispatch(setOngoingCall(undefined));
    } catch (error) {
      console.error("Error clearing latest ongoing call", error);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function sendWhatsapp(phoneNumber: string, body: string) {
    try {
      let formattedNumber = phoneNumber.replace(/\D/g, "");
      if (formattedNumber.startsWith("0")) {
        formattedNumber = `+972${formattedNumber.slice(1)}`;
      }
      const encodedMessage = encodeURIComponent(body);
      // const url = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
      const url = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;
      // open window and close that new tab after 5 seconds
      window.open(url, "_blank");
      // if (newWindow) {
      //   setTimeout(() => {
      //     try {
      //       newWindow.close();
      //     } catch (error) {
      //       console.error("Error closing new window", error);
      //     }
      //   }, 4000);
      // }
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
    clearLatestOngoingCall,
  };
}
