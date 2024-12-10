import { MessageComponent } from "@/app/(content)/messages/components/message";
import SortableItem from "@/app/(content)/messages/components/sortableItem";
import { Button } from "@/components/ui/button";
import useMessage, { MessagePosition } from "@/lib/hooks/useMessage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragMoveEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Message } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export const MessagesContainer = ({
  messages,
  handleMessageClick,
}: {
  messages: Omit<Message, "createdAt">[];
  handleMessageClick: (message: Omit<Message, "createdAt">) => void;
}) => {
  const [sortedMessages, setSortedMessages] = useState(messages);
  const { updateMessagesPosition } = useMessage();
  const [changesMade, setChangesMade] = useState(false);
  const copyToClipboardRef = useRef(true);

  useEffect(() => {
    const sortedMessages = messages.sort((a, b) => a.position - b.position);
    setSortedMessages(sortedMessages);
  }, [messages]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: { active: any; over: any }) => {
    copyToClipboardRef.current = true;
    if (active.id !== over?.id) {
      setSortedMessages(prev => {
        const oldIndex = prev.findIndex(item => item.id === active.id);
        const newIndex = prev.findIndex(item => item.id === over.id);
        const newArray = arrayMove(prev, oldIndex, newIndex);
        setChangesMade(true);
        updateMessagesPosition(
          newArray.map((item, index) => ({ id: item.id, position: index })),
          true,
        );
        return newArray;
      });
    }
  };

  const onCommitChanges = () => {
    toast.promise(
      updateMessagesPosition(
        sortedMessages.map((item, index) => ({ id: item.id, position: index })),
      ),
      {
        pending: "שומר...",
        success: {
          render: () => {
            setChangesMade(false);
            return "השינויים נשמרו בהצלחה";
          },
        },
        error: {
          render: () => {
            setChangesMade(false);
            return "שגיאה בשמירה";
          },
        },
      },
      {
        rtl: true,
      },
    );
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const newCanCopyToClipboard =
      Math.abs(event.delta.x) < 10 && Math.abs(event.delta.y) < 10;
    copyToClipboardRef.current = newCanCopyToClipboard;
  };

  const copyToClipboard = (message: Partial<Message>) => {
    {
      if (!copyToClipboardRef.current) return;
      if (window && navigator.clipboard && message.body) {
        navigator.clipboard.writeText(message.body);
        toast("העתקתי את ההודעה. תהנה :)", {
          rtl: true,
        });
      } else {
        toast("לא ניתן להעתיק את ההודעה", {
          rtl: true,
        });
      }
    }
  };

  return (
    <div className="h-full w-full relative">
      <AnimatePresence>
        {changesMade && (
          <motion.div
            key="commit-changes"
            className="fixed w-full h-12 4k:h-32 bg-muted bottom-16 md:bottom-0 left-0 flex items-center justify-center gap-4 border-t border-foreground/40 z-40"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Button
              className="absolute right-4 bg-transparent shadow-none border-none md:shadow-md md:border md:border-muted-foreground 4k:text-3xl 4k:px-8 4k:py-12"
              variant="outline"
              onClick={() => setChangesMade(false)}
            >
              <X className="h-6 w-6 4k:!w-12 4k:!h-12" />
            </Button>
            <Button
              className="4k:text-3xl 4k:px-8 4k:py-12 4k:rounded-xl"
              onClick={onCommitChanges}
            >
              שמור שינויים
            </Button>
            <span className="hidden md:block 4k:text-4xl">
              שינויים שנעשו לא נשמרו. לחץ על שמור כדי לשמור אותם
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedMessages.map(msg => msg.id)}
          strategy={rectSortingStrategy} // Grid sorting strategy
        >
          <div className="grid grid-cols-2 md:grid-cols-8 4k:grid-cols-10 gap-4">
            {sortedMessages.map(message => (
              <SortableItem key={message.id} id={message.id}>
                <MessageComponent
                  className="touch-none"
                  message={message}
                  onClick={handleMessageClick}
                  onLongPress={() => copyToClipboard(message)}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
