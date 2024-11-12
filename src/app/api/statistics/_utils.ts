import { PhoneCall } from "@prisma/client";
import { Daily, Day, Weekly, Week, Monthly, Month } from "@/models/statistics";
import moment from "moment";
import { dayNumberToName } from "@/lib/utils/dateUtils";

export function dividePhoneCallsToDays(phoneCalls: PhoneCall[]): Daily {
  const days: { [key: number]: PhoneCall[] } = {};
  const phoneCallsByDay: Daily = {};

  phoneCalls.forEach(phoneCall => {
    const day = moment(phoneCall.startDate).get("day");
    if (!Object.keys(days).includes(day.toString())) {
      days[day] = [];
    }
    days[day].push(phoneCall);
  });

  Object.keys(days).forEach(day => {
    const dayName = dayNumberToName(day as unknown as number) as Day;
    phoneCallsByDay[dayName] = days[day as unknown as number].length;
  });
  return phoneCallsByDay;
}

export function dividePhoneCallsToWeeks(phoneCalls: PhoneCall[]): Weekly {
  const weeks: { [key: number]: PhoneCall[] } = {};
  const phoneCallsByWeek: Weekly = {};

  phoneCalls.forEach(phoneCall => {
    const week = moment(phoneCall.startDate).isoWeek();
    if (!Object.keys(weeks).includes(week.toString())) {
      weeks[week] = [];
    }
    weeks[week].push(phoneCall);
  });

  Object.keys(weeks).forEach(week => {
    phoneCallsByWeek[week as unknown as Week] =
      weeks[week as unknown as number].length;
  });
  return phoneCallsByWeek;
}

export function dividePhoneCallsToMonths(phoneCalls: PhoneCall[]): Monthly {
  const months: { [key: number]: PhoneCall[] } = {};
  const phoneCallsByMonth: Monthly = {};

  phoneCalls.forEach(phoneCall => {
    const month = moment(phoneCall.startDate).get("month");
    if (!Object.keys(months).includes(month.toString())) {
      months[month] = [];
    }
    months[month].push(phoneCall);
  });

  Object.keys(months).forEach(month => {
    const monthName = moment().month(parseInt(month)).format("MMM") as Month;
    phoneCallsByMonth[monthName] = months[month as unknown as number].length;
  });
  return phoneCallsByMonth;
}
