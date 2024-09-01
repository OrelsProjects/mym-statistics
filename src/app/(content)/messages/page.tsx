"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Folder, Message } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import Loading from "../../../components/ui/loading";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { selectAuth } from "../../../lib/features/auth/authSlice";
import { useAppSelector } from "../../../lib/hooks/redux";
import useMessage from "../../../lib/hooks/useMessage";
import { useFormik } from "formik";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "react-toastify";
import { FolderNoCreatedAt } from "../../../models/folder";
import usePhonecall from "../../../lib/hooks/usePhonecall";
import LongPressDiv from "../../../components/ui/longPressDiv";

interface MessagePageProps {}

const FoldersDropdown = ({
  selectedFolderId,
  onFolderSelected,
}: {
  selectedFolderId?: string | null;
  onFolderSelected: (folderId: string) => void;
}) => {
  const { folders } = useAppSelector(selectAuth);

  const selectedFolder = useMemo(
    () => folders.find(folder => folder.id === selectedFolderId),
    [selectedFolderId],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="4k:text-6xl 4k:py-16">
          {selectedFolder?.title || "תיקיות"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="4k:pl-16 4k:py-4">
        <DropdownMenuLabel dir="rtl" className="text-lg 4k:text-5xl">
          תיקיות
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col 4k:gap-6">
          {[...folders].map(folder => (
            <DropdownMenuItem
              dir="rtl"
              key={`folder-${folder.id}`}
              className="text-lg 4k:text-4xl"
              onClick={() => onFolderSelected(folder.id)}
            >
              {folder.title}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MessageComponent = ({
  message,
  onClick,
}: {
  message: Omit<Message, "createdAt">;
  onClick?: (message: Omit<Message, "createdAt">) => void;
  onLongClick?: (message: Omit<Message, "createdAt">) => void;
}) => (
  <LongPressDiv
    className="h-24 w-24 4k:h-64 4k:w-64 flex flex-col justify-center items-center rounded-lg shadow-lg dark:bg-muted p-2 hover:cursor-pointer"
    onLongPress={() => {
      if (window && navigator.clipboard) {
        navigator.clipboard.writeText(message.body);
        toast.info("הודעה הועתקה ללוח");
      }
    }}
  >
    <p className="4k:text-2xl">{message.shortTitle}</p>
    <h3 className="line-clamp-1 text-center 4k:text-4xl">{message.title}</h3>
  </LongPressDiv>
);

const EditMessageComponent = ({
  open,
  message,
  folder,
  onEdit,
  onDelete,
  onCreate,
  onClose,
}: {
  open: boolean;
  message: Omit<Message, "createdAt"> | null;
  folder: FolderNoCreatedAt | null;
  onDelete: (messageId: string) => void;
  onCreate: ({
    title,
    shortTitle,
    body,
    folderId,
    position,
  }: {
    title: string;
    shortTitle: string;
    body: string;
    folderId: string;
    position: number;
  }) => void;
  onEdit: ({
    title,
    shortTitle,
    body,
    position,
    folderId,
    id,
    oldFolderId,
  }: {
    title: string;
    shortTitle: string;
    body: string;
    position: number;
    folderId: string;
    id: string;
    oldFolderId?: string;
  }) => void;
  onClose: () => void;
}) => {
  const isEdit = useMemo(() => !!message?.title, [message]);

  const formik = useFormik({
    initialValues: {
      title: message?.title || "",
      shortTitle: message?.shortTitle || "",
      body: message?.body || "",
      folderId: folder?.id || "",
      position: message?.position || 0,
      oldFolderId: folder?.id,
    },
    onSubmit: values => {
      if (!values.folderId) {
        toast.error("נא לבחור תיקיה");
        return;
      }
      const { oldFolderId, ...messageNoOldFolderId } = values;
      if (isEdit && message) {
        onEdit({
          ...messageNoOldFolderId,
          id: message.id,
          oldFolderId: values.oldFolderId,
        });
      } else {
        onCreate(messageNoOldFolderId);
      }
    },
  });

  useEffect(() => {
    formik.setValues({
      title: message?.title || "",
      shortTitle: message?.shortTitle || "",
      body: message?.body || "",
      position: message?.position || 0,
      folderId: folder?.id || "",
      oldFolderId: folder?.id || "",
    });
  }, [message, folder]);

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) onClose();
      }}
    >
      <DialogContent
        closeOnOutsideClick={false}
        className="4k:w-[80%] 4k:aspect-video 4k:max-w-full "
      >
        <form
          onSubmit={formik.handleSubmit}
          className="h-full flex flex-col gap-4 justify-start"
          dir="rtl"
        >
          <DialogTitle dir="rtl" className="mt-8 4k:text-6xl">
            עריכת הודעה
          </DialogTitle>
          <FoldersDropdown
            onFolderSelected={folderId =>
              formik.setFieldValue("folderId", folderId)
            }
            selectedFolderId={formik.values.folderId}
          />

          <Input
            label="כותרת"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            required
            className="4k:text-2xl"
          />
          <Input
            label="כותרת קצרה"
            name="shortTitle"
            value={formik.values.shortTitle}
            onChange={formik.handleChange}
            maxLength={3}
            required
          />
          <Textarea
            label="תוכן"
            name="body"
            value={formik.values.body}
            onChange={formik.handleChange}
            rows={10}
            required
          />
          <Button type="submit">שמור</Button>
          {isEdit && (
            <Button
              variant="link"
              className="text-destructive"
              onClick={() => {
                if (message) onDelete(message.id);
              }}
            >
              מחק
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MessagePage: React.FC<MessagePageProps> = () => {
  const { ongoingCall, sendWhatsapp } = usePhonecall();
  const [selectedFolderId, setSelectedFolder] = useState<string>("");
  const [messageToEdit, setMessageToEdit] = useState<Omit<
    Message,
    "createdAt"
  > | null>(null);
  const { updateMessage, createMessage, deleteMessage } = useMessage();
  const { data, loadingData, folders } = useAppSelector(selectAuth);

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
      if (ongoingCall && ongoingCall.number) {
        await sendWhatsapp(ongoingCall.number, message.body);
      } else {
        setMessageToEdit(message);
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

  return (
    <div className="h-full w-full flex flex-col gap-4" dir="rtl">
      <FoldersDropdown
        onFolderSelected={setSelectedFolder}
        selectedFolderId={selectedFolder?.id}
      />
      <div
        className="flex flex-wrap justify-center md:justify-start gap-4"
        dir="rtl"
      >
        {data
          .filter(message => message?.folder?.id === selectedFolderId)
          .map(({ folder, ...message }) => (
            <MessageComponent
              key={message.id}
              message={message}
              onClick={handleMessageClick}
            />
          ))}
      </div>
      <Button
        variant="secondary"
        className="4k:py-8 4k:text-2xl"
        onClick={() => setMessageToEdit({} as any)}
      >
        הוסף הודעה
      </Button>
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
    </div>
  );
};

export default MessagePage;
