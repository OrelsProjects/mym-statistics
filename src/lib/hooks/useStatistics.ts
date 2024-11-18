import axios, { CancelTokenSource } from "axios";
import {
  CallsStatistics,
  MessageSentStatistics,
} from "@/lib/utils/statisticsUtils";
import { Logger } from "@/logger";

let messagesCancelTokenSource: CancelTokenSource | null = null;
let callsCancelTokenSource: CancelTokenSource | null = null;

export default function useStatistics() {
  const getMessagesSentStatistics = async (from: string, to: string) => {
    // Cancel the previous messages request if it exists
    if (messagesCancelTokenSource) {
      messagesCancelTokenSource.cancel(
        "Cancelled previous messages request for new data.",
      );
    }

    // Create a new cancellation token for the messages request
    messagesCancelTokenSource = axios.CancelToken.source();

    try {
      const stats = await axios.get<MessageSentStatistics[]>(
        `/api/statistics/messages-sent?from=${from}&to=${to}`,
        { cancelToken: messagesCancelTokenSource.token },
      );
      // Clear the messages cancel token after the request completes
      messagesCancelTokenSource = null;
      return stats.data;
    } catch (error) {
      // Handle only non-cancellation errors
      if (!axios.isCancel(error)) {
        Logger.error("Error fetching messages sent statistics", {
          data: { error },
        });
      }
      throw error;
    }
  };

  const getCallsStatistics = async (
    from: string,
    to: string,
  ): Promise<CallsStatistics> => {
    // Cancel the previous calls request if it exists
    if (callsCancelTokenSource) {
      callsCancelTokenSource.cancel(
        "Cancelled previous calls request for new data.",
      );
    }

    // Create a new cancellation token for the calls request
    callsCancelTokenSource = axios.CancelToken.source();

    try {
      const stats = await axios.get<CallsStatistics>(
        `/api/statistics/calls?from=${from}&to=${to}`,
        { cancelToken: callsCancelTokenSource.token },
      );
      // Clear the calls cancel token after the request completes
      callsCancelTokenSource = null;
      return stats.data;
    } catch (error) {
      // Handle only non-cancellation errors
      if (!axios.isCancel(error)) {
        Logger.error("Error fetching call statistics", { data: { error } });
      }
      throw error;
    }
  };

  return {
    getMessagesSentStatistics,
    getCallsStatistics,
  };
}
