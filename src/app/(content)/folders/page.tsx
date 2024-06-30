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
import useFolder from "../../../lib/hooks/useFolder";

interface FolderPageProps {}

const FolderComponent = ({
  folder,
  onClick,
}: {
  folder: FolderNoCreatedAt;
  onClick?: (folder: FolderNoCreatedAt) => void;
}) => (
  <div
    className="h-24 w-24 flex flex-col justify-center items-center rounded-lg shadow-lg dark:bg-muted p-2 hover:cursor-pointer"
    onClick={() => onClick?.(folder)}
  >
    <h3 className="line-clamp-1 text-center">{folder.title}</h3>
  </div>
);

const EditMessageComponent = ({
  open,
  folder,
  onDelete,
  onEdit,
  onCreate,
  onClose,
}: {
  open: boolean;
  folder: FolderNoCreatedAt | null;
  onDelete: (id: string) => void;
  onCreate: ({ title, position }: { title: string; position: number }) => void;
  onEdit: ({
    title,
    position,
    id,
  }: {
    title: string;
    position: number;
    id: string;
  }) => void;
  onClose: () => void;
}) => {
  const isEdit = useMemo(() => !!folder?.title, [folder]);

  const formik = useFormik({
    initialValues: {
      title: folder?.title || "",
      id: folder?.id,
      position: folder?.position || 0,
    },
    onSubmit: values => {
      if (isEdit && folder) {
        onEdit({ ...values, id: folder.id });
      } else {
        onCreate(values);
      }
    },
  });

  useEffect(() => {
    formik.setValues({
      title: folder?.title || "",
      position: folder?.position || 0,
      id: folder?.id,
    });
  }, [folder]);

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) onClose();
      }}
    >
      <DialogContent closeOnOutsideClick={false}>
        <DialogTitle dir="rtl" className="mt-8">
          עריכת תיקייה
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
          <Button type="submit">שמור</Button>
          {isEdit && (
            <Button
              variant="link"
              className="text-destructive"
              onClick={() => folder && onDelete(folder.id)}
            >
              מחק
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

const MessagePage: React.FC<FolderPageProps> = () => {
  const [folderToEdit, setFolderToEdit] = useState<FolderNoCreatedAt | null>(
    null,
  );
  const { createFolder, updateFolder, deleteFolder } = useFolder();
  const { folders, loadingData } = useAppSelector(selectAuth);

  if (loadingData)
    return (
      <Loading
        spinnerClassName="w-20 h-20"
        className="w-full h-full flex items-center justify-center"
      />
    );

  return (
    <div className="h-full w-full flex flex-col gap-4" dir="rtl">
      <div className="flex flex-wrap gap-4" dir="rtl">
        {folders.map(folder => (
          <FolderComponent
            key={`folder-id-${folder.id}`}
            folder={folder}
            onClick={folder => setFolderToEdit(folder)}
          />
        ))}
      </div>
      <Button variant="secondary" onClick={() => setFolderToEdit({} as any)}>
        הוסף תיקייה
      </Button>
      <EditMessageComponent
        open={!!folderToEdit}
        folder={folderToEdit}
        onDelete={id => {
          try {
            deleteFolder(id);
            setFolderToEdit(null);
          } catch (error: any) {
            toast.error("שגיאה במחיקת התיקייה");
          }
        }}
        onCreate={folder => {
          try {
            createFolder(folder);
            setFolderToEdit(null);
          } catch (error: any) {
            toast.error("שגיאה ביצירת התיקייה");
          }
        }}
        onEdit={({ id, ...folder }) => {
          try {
            updateFolder(folder, id);
            setFolderToEdit(null);
          } catch (error: any) {
            toast.error("שגיאה בעדכון התיקייה");
          }
        }}
        onClose={() => setFolderToEdit(null)}
      />
    </div>
  );
};

export default MessagePage;
