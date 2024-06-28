"use client";

import React, { useEffect, useMemo, useState } from "react";
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

interface MessagePageProps {}

const MessageComponent = ({
  message,
  onClick,
}: {
  message: Omit<Message, "createdAt">;
  onClick?: (message: Omit<Message, "createdAt">) => void;
}) => (
  <div
    className="h-24 w-24 flex flex-col justify-center items-center rounded-lg shadow-lg dark:bg-muted p-2 hover:cursor-pointer"
    onClick={() => onClick?.(message)}
  >
    <p>{message.shortTitle}</p>
    <h3 className="line-clamp-1 text-center">{message.title}</h3>
  </div>
);

const EditMessageComponent = ({
  open,
  message,
  onEdit,
  onClose,
}: {
  open: boolean;
  message: Omit<Message, "createdAt"> | null;
  onEdit: ({
    title,
    shortTitle,
    body,
    position,
    id,
  }: {
    title: string;
    shortTitle: string;
    body: string;
    position: number;
    id: string;
  }) => void;
  onClose: () => void;
}) => {
  const formik = useFormik({
    initialValues: {
      title: message?.title || "",
      shortTitle: message?.shortTitle || "",
      body: message?.body || "",
      position: message?.position || 0,
    },
    onSubmit: values => {
      if (!message) return;
      onEdit({ ...values, id: message.id });
    },
  });

  useEffect(() => {
    formik.setValues({
      title: message?.title || "",
      shortTitle: message?.shortTitle || "",
      body: message?.body || "",
      position: message?.position || 0,
    });
  }, [message]);

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle dir="rtl" className="mt-8">
          עריכת הודעה
        </DialogTitle>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4"
          dir="rtl"
        >
          <Input
            label="כותרת"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
          />
          <Input
            label="כותרת קצרה"
            name="shortTitle"
            value={formik.values.shortTitle}
            onChange={formik.handleChange}
            maxLength={3}
          />
          <Textarea
            label="תוכן"
            name="body"
            value={formik.values.body}
            onChange={formik.handleChange}
            rows={10}
          />
          <Button type="submit">שמור</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MessagePage: React.FC<MessagePageProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFolderId, setSelectedFolder] = useState<string>("");
  const [messageToEdit, setMessageToEdit] = useState<Omit<
    Message,
    "createdAt"
  > | null>(null);
  const { getMessagesData, updateMessage } = useMessage();
  const { data } = useAppSelector(selectAuth);

  const fetchData = async () => {
    try {
      setLoading(true);
      await getMessagesData();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedFolderId && data.length) {
      setSelectedFolder(data[0]?.folder?.id || "");
    }
  }, [data]);

  const selectedFolder = useMemo(() => {
    return data.find(message => message.folder?.id === selectedFolderId);
  }, [selectedFolderId]);

  const folders: Folder[] = useMemo(() => {
    const allFolders = data
      .map(message => message.folder)
      .filter(Boolean) as Folder[];
    const foldersNoDuplicates = allFolders.filter(
      (folder, index, self) =>
        index === self.findIndex(t => t.id === folder.id),
    );
    return foldersNoDuplicates;
  }, [data]);

  if (loading)
    return (
      <Loading
        spinnerClassName="w-20 h-20"
        className="w-full h-full flex items-center justify-center"
      />
    );

  return (
    <div className="h-full w-full flex flex-col gap-4" dir="rtl">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{selectedFolder?.title || "תיקיות"}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel dir="rtl">תיקיות</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {folders?.map(folder => (
            <DropdownMenuItem
              dir="rtl"
              key={`folder-${folder.id}`}
              onClick={() => setSelectedFolder(folder.id)}
            >
              {folder.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-wrap gap-4" dir="rtl">
        {data
          .filter(message => message?.folder?.id === selectedFolderId)
          .map(({ folder, ...message }) => (
            <MessageComponent
              key={message.id}
              message={message}
              onClick={message => setMessageToEdit(message)}
            />
          ))}
      </div>
      <EditMessageComponent
        open={!!messageToEdit}
        message={messageToEdit}
        onEdit={message => {
          const { id, ...data } = message;
          try {
            updateMessage(data, id);
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
