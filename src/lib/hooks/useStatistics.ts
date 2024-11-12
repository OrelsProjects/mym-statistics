import axios, { CancelTokenSource } from "axios";
import { MessageSentStatistics } from "@/lib/utils/statisticsUtils";
import { Logger } from "@/logger";

let cancelTokenSource: CancelTokenSource | null = null;

export default function useStatistics() {
  const getMessagesSentStatistics = async (from: string, to: string) => {
    // Cancel the previous request if it exists
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Cancelled previous request for new data.");
    }

    // Create a new cancellation token for the new request
    cancelTokenSource = axios.CancelToken.source();

    try {
      const stats = await axios.get<MessageSentStatistics[]>(
        `/api/statistics/messages-sent?from=${from}&to=${to}`,
        { cancelToken: cancelTokenSource.token },
      );
      // Clear the cancel token after the request completes
      cancelTokenSource = null;
      return stats.data;
    } catch (error) {
      // Handle only non-cancellation errors
      if (!axios.isCancel(error)) {
        Logger.error("Error fetching statistics", { data: { error } });
      }
      throw error;
    }
  };

  return {
    getMessagesSentStatistics,
  };
}
