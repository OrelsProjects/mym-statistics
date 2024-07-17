"use client";

import * as React from "react";
import { IoIosRefresh } from "react-icons/io";
import { collection, onSnapshot } from "firebase/firestore";
import usePhonecall from "../../lib/hooks/usePhonecall";
import Loading from "../../components/ui/loading";
import { db } from "../../../firebase.config";
import { useAppSelector } from "../../lib/hooks/redux";
import { selectAuth } from "../../lib/features/auth/authSlice";

export function OngoingCallProvider() {
  const { user } = useAppSelector(selectAuth);
  const { ongoingCall, loading, getLatestOngoingCall } = usePhonecall();

  React.useEffect(() => {
    try {
      getLatestOngoingCall();
    } catch (error) {
      console.error("Error getting latest ongoing call", error);
    }
  }, []);

  React.useEffect(() => {
    let unsubscribe: () => void = () => {};
    if (db && user) {
      const unsubscribe = onSnapshot(
        collection(db, "users", user.id, "ongoingCalls"),
        async _ => {
          await getLatestOngoingCall();
        },
      );

      return () => {
        unsubscribe();
      };
    }

    return () => {
      unsubscribe();
    };
  }, [db, user]);

  return (
    <div className="w-full absolute top-0 flex flex-row justify-center items-center gap-2">
      {ongoingCall
        ? ongoingCall.contactName || ongoingCall.number
        : "אין שיחה פעילה"}
      {loading ? (
        <Loading spinnerClassName="w-5 h-5 fill-foreground" />
      ) : (
        <IoIosRefresh
          className="cursor-pointer w-5 h-5"
          onClick={getLatestOngoingCall}
        />
      )}
    </div>
  );
}
