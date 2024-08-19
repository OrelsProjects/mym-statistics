"use client";

import * as React from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { IoIosRefresh } from "react-icons/io";
import usePhonecall from "../../lib/hooks/usePhonecall";
import Loading from "../../components/ui/loading";
import { db } from "../../../firebase.config";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/redux";
import { selectAuth } from "../../lib/features/auth/authSlice";
import {
  setIsInit,
  setOngoingCall,
} from "../../lib/features/ongoingCall/ongoingCallSlice";
import { Logger } from "../../logger";

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
      Logger.debug("Subscribing to ongoing call snapshot", {
        data: { user: JSON.stringify(user) },
      });
      unsubscribe = onSnapshot(
        collection(db, "users", user.id, "ongoingCalls"),
        async doc => {
          if (!isInit) {
            await getLatestOngoingCall();
            setIsInit(true);
            return;
          }
          Logger.debug("Ongoing call snapshot", {
            data: { changes: JSON.stringify(doc.docChanges() || "{}") },
          });
          const latestOngoingCall = doc.docChanges()?.[0]?.doc?.data();
          Logger.debug("Latest ongoing call", {
            data: {
              latestOngoingCall: JSON.stringify(latestOngoingCall || "{}"),
            },
          });
          if (latestOngoingCall.endDate) {
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
