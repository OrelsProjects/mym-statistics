export type Day =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type Month =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

export type Week = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Daily = {
  // not all days must have a value
  [key in Day]?: number;
};

export type Weekly = {
  [key in Week]?: number;
};

export type Monthly = {
  [key in Month]?: number;
};

export type PhonecallCountStatisticsType = "daily" | "weekly" | "monthly";

export interface PhonecallCountStatistics {
  daily?: Daily;
  weekly?: Weekly;
  monthly?: Monthly;
}
