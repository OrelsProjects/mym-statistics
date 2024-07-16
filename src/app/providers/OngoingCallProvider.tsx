"use client";

import * as React from "react";
import usePhonecall from "../../lib/hooks/usePhonecall";
import { IoIosRefresh } from "react-icons/io";
import Loading from "../../components/ui/loading";

export function OngoingCallProvider() {
  const { ongoingCall, loading, getLatestOngoingCall } = usePhonecall();

  React.useEffect(() => {
    try {
      getLatestOngoingCall();
    } catch (error) {
      console.error("Error getting latest ongoing call", error);
    }
  }, []);

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
