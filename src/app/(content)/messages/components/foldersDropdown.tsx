import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { selectAuth } from "@/lib/features/auth/authSlice";
import { useAppSelector } from "@/lib/hooks/redux";
import { useMemo } from "react";

export const FoldersDropdown = ({
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
