import LongPressDiv from "@/components/ui/longPressDiv";
import { cn } from "@/lib/utils";
import { Message } from "@prisma/client";

export const MessageComponent = ({
  className,
  message,
  onClick,
  onLongPress,
}: {
  className?: string;
  message: Omit<Message, "createdAt">;
  onLongPress?: (message: Omit<Message, "createdAt">) => void;
  onClick?: (message: Omit<Message, "createdAt">) => void;
}) => (
  <LongPressDiv
    className={cn(
      "h-full w-full flex aspect-square flex-col justify-center items-center rounded-lg shadow-lg dark:bg-muted p-2 hover:cursor-pointer",
      className,
    )}
    onClick={() => onClick && onClick(message)}
    onLongPress={() => {
      onLongPress && onLongPress(message);
    }}
  >
    <p className="4k:text-2xl">{message.shortTitle}</p>
    <h3 className="line-clamp-1 text-center 4k:text-4xl">{message.title}</h3>
  </LongPressDiv>
);
