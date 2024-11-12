import moment from "moment";

export interface MessageSentStatistics {
  title: string;
  count: string;
}

// interface GroupedStatistics {
//   label: string;
//   values: MessageSentStatistics[];
// }

// export function groupStatistics(data: MessageSentStatistics[]): {
//   graphType: "bar" | "line";
//   groupedData: GroupedStatistics[];
// } {
//   if (data.length === 0) {
//     return { graphType: "bar", groupedData: [] };
//   }

//   // Calculate the range from the earliest to latest date in data
//   const dates = data.map(item => moment(item.sentAt));
//   const minDate = moment.min(dates);
//   const maxDate = moment.max(dates);
//   const rangeInDays = maxDate.diff(minDate, "days");

//   let groupedData: GroupedStatistics[] = [];
//   let graphType: "bar" | "line" = "bar";

//   if (rangeInDays <= 7) {
//     // Daily grouping
//     groupedData = groupByPeriod(data, "day");
//   } else if (rangeInDays <= 60) {
//     // Weekly grouping
//     groupedData = groupByPeriod(data, "week");
//   } else if (rangeInDays <= 365) {
//     // Monthly grouping
//     groupedData = groupByPeriod(data, "month");
//   } else {
//     // Yearly grouping with line graph
//     groupedData = groupByPeriod(data, "year");
//     graphType = "line";
//   }

//   return { graphType, groupedData };
// }

// function groupByPeriod(
//   data: MessageSentStatistics[],
//   period: "day" | "week" | "month" | "year",
// ): GroupedStatistics[] {
//   // Initialize the structure for grouping
//   const grouped: Record<string, MessageSentStatistics[]> = {};

//   data.forEach(item => {
//     // Format date based on the period
//     const periodLabel = moment(item.sentAt)
//       .startOf(period)
//       .format(period === "day" ? "dddd" : "YYYY-MM-DD");
//     if (!grouped[periodLabel]) {
//       grouped[periodLabel] = [];
//     }
//     grouped[periodLabel].push(item);
//   });

//   // Map grouped data to the desired format
//   return Object.entries(grouped).map(([label, values]) => ({
//     label,
//     values,
//   }));
// }
