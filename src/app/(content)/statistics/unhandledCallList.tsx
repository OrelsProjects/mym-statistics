import { Button } from "@/components/ui/button";
import {
  UnhandledCall,
  toTelHref,
  toWhatsAppHref,
} from "@/lib/utils/unhandledCalls";
import { format } from "date-fns";

function formatCallTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return format(date, "dd/MM/yyyy HH:mm");
}

function callKindLabel(type: string): string {
  return type === "MISSED" ? "לא נענתה" : "נכנסת שלא נענתה";
}

export function UnhandledCallList({ calls }: { calls: UnhandledCall[] }) {
  return (
    <div className="w-full mt-6 flex flex-col gap-3" dir="rtl">
      <div>
        <h3 className="text-lg 4k:text-4xl font-bold">שיחות שלא טופלו</h3>
        <p className="text-sm 4k:text-2xl text-muted-foreground">
          שיחה נכנסת או שלא נענתה, בלי הודעה שנשלחה ובלי חזרה לאותו מספר אחר כך.
        </p>
      </div>
      {calls.length === 0 ? (
        <p className="text-muted-foreground">אין שיחות שלא טופלו בתקופה הזו</p>
      ) : (
        <ul className="flex flex-col divide-y rounded-md border max-h-96 overflow-y-auto">
          {calls.map(call => {
            const title = call.contactName?.trim() || call.number;
            return (
              <li
                key={call.id}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{title}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {call.number} · {formatCallTime(call.startDate)} ·{" "}
                    {callKindLabel(call.type)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <a href={toTelHref(call.number)}>התקשר</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={toWhatsAppHref(call.number)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      וואטסאפ
                    </a>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
