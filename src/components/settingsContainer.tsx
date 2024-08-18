import React from "react";
import Link from "next/link";
import { useAppSelector } from "../lib/hooks/redux";
import { UserAvatar } from "./ui/avatar";

interface SettingsComponentProps {}

const SettingsComponent: React.FC<SettingsComponentProps> = () => {
  const { user, state } = useAppSelector(state => state.auth);

  return (
    state === "authenticated" && (
      <div className="p-2 rounded-lg w-full flex flex-col items-end">
        <Link href="/settings" className="w-fit h-fit">
          <UserAvatar
            photoURL={user?.photoURL || "/images/default-profile.png"}
            displayName={user?.displayName}
            imageClassName="rounded-full hover:cursor-pointer !w-12 !h-12 shadow-md  2xl:!h-24 2xl:!w-24"
            className="w-12 h-12 md:hover:shadow-lg md:hover:cursor-pointer rounded-full"
            hideTooltip
          />
        </Link>
      </div>
    )
  );
};

export default SettingsComponent;
