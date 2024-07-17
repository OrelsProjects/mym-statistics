"use client";

import * as React from "react";
import { IoIosRefresh } from "react-icons/io";
import { collection, onSnapshot } from "firebase/firestore";
import usePhonecall from "../../lib/hooks/usePhonecall";
import Loading from "../../components/ui/loading";
import { db } from "../../../firebase.config";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/redux";
import { selectAuth } from "../../lib/features/auth/authSlice";
import { setOngoingCall } from "../../lib/features/ongoingCall/ongoingCallSlice";

export function OngoingCallProvider() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { loading, ongoingCall, isInit } = useAppSelector(
    state => state.ongoingCall,
  );
  const { getLatestOngoingCall } = usePhonecall();

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
      unsubscribe = onSnapshot(
        collection(db, "users", user.id, "ongoingCalls"),
        async doc => {
          if (!isInit) {
            await getLatestOngoingCall();
            return;
          }
          const latestOngoingCall = doc.docChanges()?.[0]?.doc?.data();
          if (latestOngoingCall.endDate) {
            dispatch(setOngoingCall(undefined));
          } else {
            dispatch(setOngoingCall(latestOngoingCall));
          }
        },
      );
    }

    return () => {
      unsubscribe();
    };
  }, [db, user, isInit]);

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
