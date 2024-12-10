import { FoldersDropdown } from "@/app/(content)/messages/components/foldersDropdown";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderNoCreatedAt } from "@/models/folder";
import { Message } from "@prisma/client";
import { useFormik } from "formik";
import { useMemo, useEffect } from "react";
import { toast } from "react-toastify";

export const EditMessageComponent = ({
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
