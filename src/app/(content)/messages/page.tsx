"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Message } from "@prisma/client";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { selectAuth } from "@/lib/features/auth/authSlice";
import { useAppSelector } from "@/lib/hooks/redux";
import useMessage from "@/lib/hooks/useMessage";
import { toast } from "react-toastify";
import usePhonecall from "@/lib/hooks/usePhonecall";
import { Logger } from "@/logger";
import { MessagesContainer } from "@/app/(content)/messages/components/messagesContainer";
import { FoldersDropdown } from "@/app/(content)/messages/components/foldersDropdown";
import { EditMessageComponent } from "@/app/(content)/messages/components/editMessageDialog";

interface MessagePageProps {}

const MessagePage: React.FC<MessagePageProps> = () => {
  const { ongoingCall, sendWhatsapp, getLatestOngoingCall } = usePhonecall();
  const { updateMessage, createMessage, deleteMessage } = useMessage();
  const { data, loadingData, folders } = useAppSelector(selectAuth);
  const [selectedFolderId, setSelectedFolder] = useState<string>("");
  const [messageToEdit, setMessageToEdit] = useState<Omit<
    Message,
    "createdAt"
  > | null>(null);

  useEffect(() => {
    addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        getLatestOngoingCall();
      }
    });
    return () => {
      removeEventListener("visibilitychange", getLatestOngoingCall);
    };
  }, []);

  useEffect(() => {
    if (!selectedFolderId && folders.length) {
      setSelectedFolder(folders[0].id);
    }
  }, [data]);

  const selectedFolder = useMemo(() => {
    return folders.find(folder => folder?.id === selectedFolderId);
  }, [selectedFolderId]);

  const handleMessageClick = useCallback(
    async (message: Omit<Message, "createdAt">) => {
      try {
        const latestCall = await getLatestOngoingCall();
        const number = ongoingCall?.number || latestCall?.number;
        if (number) {
          await sendWhatsapp(number, message.body);
        } else {
          setMessageToEdit(message);
        }
      } catch (error: any) {
        Logger.error("Error sending message", error);
        toast.error("שגיאה בשליחת הודעה");
      }
    },
    [ongoingCall],
  );

  if (loadingData)
    return (
      <Loading
        spinnerClassName="w-20 h-20"
        className="w-full h-full flex items-center justify-center"
      />
    );

  const folderMessages = data.filter(
    message => message.folder?.id === selectedFolderId,
  );

  return (
    <div className="h-full w-full flex flex-col gap-4 pb-4 4k:pb-10" dir="rtl">
      <FoldersDropdown
        onFolderSelected={setSelectedFolder}
        selectedFolderId={selectedFolder?.id}
      />
      <MessagesContainer
        messages={folderMessages}
        handleMessageClick={handleMessageClick}
      />
      {
        <EditMessageComponent
          open={!!messageToEdit}
          message={messageToEdit}
          onDelete={messageId => {
            try {
              deleteMessage(messageId);
              setMessageToEdit(null);
            } catch (error: any) {
              toast.error("שגיאה במחיקת ההודעה");
            }
          }}
          onCreate={({ folderId, ...message }) => {
            try {
              createMessage(message, folderId);
              setMessageToEdit(null);
            } catch (error: any) {
              toast.error("שגיאה ביצירת ההודעה");
            }
          }}
          folder={selectedFolder || null}
          onEdit={message => {
            const { id, folderId, oldFolderId, ...data } = message;
            try {
              updateMessage(data, id, folderId, oldFolderId);
              setMessageToEdit(null);
            } catch (error: any) {
              toast.error("שגיאה בעדכון ההודעה");
            }
          }}
          onClose={() => setMessageToEdit(null)}
        />
      }
      <Button
        variant="secondary"
        className="4k:py-8 4k:text-2xl"
        onClick={() => {
          setMessageToEdit({
            id: "",
            userId: "",
            title: "",
            shortTitle: "",
            body: "",
            position: 0,
            timesUsed: 0,
            isActive: true,
          })
        }}
      >
        הוסף הודעה
      </Button>
    </div>
  );
};

export default MessagePage;
