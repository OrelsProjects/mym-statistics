"use client";

import React, { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { IoIosRefresh } from "react-icons/io";
import Loading from "@/components/ui/loading";
import { db } from "@/../firebase.config";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { selectAuth } from "@/lib/features/auth/authSlice";
import { setOngoingCall } from "@/lib/features/ongoingCall/ongoingCallSlice";
import { Logger } from "@/logger";
import usePhonecall from "@/lib/hooks/usePhonecall";
import { toast } from "react-toastify";

export function OngoingCallProvider() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { loading, ongoingCall, isInit } = useAppSelector(
    state => state.ongoingCall,
  );

  const { getLatestOngoingCall } = usePhonecall();

  useEffect(() => {
    const loadingToastId = toast.loading("טוען שיחה פעילה");
    if (!loading) {
      toast.dismiss(loadingToastId);
    }
    return () => {
      toast.dismiss(loadingToastId);
    };
  }, [loading]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    if (db && user && user.id) {
      Logger.debug("Subscribing to ongoing call snapshot", {
        data: { user: JSON.stringify(user) },
      });
      unsubscribe = onSnapshot(
        doc(db, "users", user.id, "ongoingCalls", "latest"),
        async doc => {
          Logger.debug("Ongoing call snapshot", {
            data: { changes: JSON.stringify(doc.data() || "{}") },
          });
          const latestOngoingCall = doc.data();
          Logger.debug("Latest ongoing call", {
            data: {
              latestOngoingCall: JSON.stringify(latestOngoingCall || "{}"),
            },
          });
          if (!latestOngoingCall) {
            dispatch(setOngoingCall(undefined));
          } else {
            dispatch(setOngoingCall(latestOngoingCall));
          }
        },
      );
    } else {
      Logger.warn("DB or user not found", {
        data: { db: JSON.stringify(db), user: JSON.stringify(user) },
      });
    }
    return () => {
      unsubscribe();
    };
  }, [db, user, isInit]);

  return (
    <div className="w-full absolute top-0 flex flex-row justify-center items-center gap-2 4k:text-5xl">
      {loading ? (
        <Loading spinnerClassName="w-5 h-5 4k:w-10 4k:h-10 fill-foreground" />
      ) : ongoingCall ? (
        ongoingCall.contactName || ongoingCall.number
      ) : (
        "אין שיחה פעילה"
      )}
      <IoIosRefresh
        className="cursor-pointer w-5 h-5 4k:w-10 4k:h-10"
        onClick={getLatestOngoingCall}
      />
    </div>
  );
}
