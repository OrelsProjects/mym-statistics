"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { Button } from "@/components/ui/button";
import useAuth from "@/lib/hooks/useAuth";
import { toast } from "react-toastify";
import { EventTracker } from "@/eventTracker";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { canUseNotifications } from "@/lib/utils/notificationUtils";
import useNotification from "@/lib/hooks/useNotification";
import { ThemeToggle } from "@/components/themeToggle";
import Divider from "@/components/ui/divider";

interface SettingsProps {}

const SettingsScreen: React.FC<SettingsProps> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { deleteUser, signOut } = useAuth();
  const { initNotifications: initUserToken, requestNotificationsPermission } =
    useNotification();
  const [settings, setSettings] =
    useState();
    // user?.settings ?? {
    //   showNotifications: false,
    //   soundEffects: true,
    // },

  const changeNotificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const isNotificationsGranted =
    canUseNotifications() && Notification.permission === "granted";

  useEffect(() => {
    console.log(settings);
  }, [settings]);

  useEffect(() => {
    if (user) {
      // setSettings(user?.settings);
    }
  }, [user]);

  const updateNotificationSettings = (showNotifications: boolean) => {
    if (changeNotificationTimeout.current) {
      clearTimeout(changeNotificationTimeout.current);
    }

    // setSettings({ ...settings, showNotifications });

    changeNotificationTimeout.current = setTimeout(async () => {
      changeNotificationTimeout.current = null;
      try {
        await axios.patch("/api/user/settings", { showNotifications });
        if (showNotifications) {
          await initUserToken();
        }
        // dispatch(updateUserSettings({ showNotifications }));
      } catch (e) {
        toast.error("Failed to update notification settings");
      }
    }, 1000);
  };

  const handleDeleteUserRequest = async () => {
    // Show alert that asks the user to insert their email. If email correct, delete user.
    // If email incorrect, show error message.
    EventTracker.track("delete_user_request");
    const email = prompt(
      `Please enter your email (${user?.email}) to confirm deletion`,
    );
    if (email === user?.email) {
      toast.promise(deleteUser(), {
        pending: "Deleting user...",
        success: "User deleted",
        error: "Failed to delete user",
      });
    } else {
      if (email) {
        alert("Email is incorrect");
      }
    }
  };

  const handleSignOut = async () => {
    EventTracker.track("sign_out");
    toast.promise(signOut(), {
      pending: "Signing out...",
      success: "Signed out",
      error: "Failed to sign out",
    });
  };

  return (
    <div className="flex flex-col gap-4 mt-3">
      <div className="flex flex-row justify-between items-center">
        <span className="text-xl font-semibold">{user?.email}</span>
      </div>
      <Divider />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">Appearance</span>
          <div className="pl-2">
            <ThemeToggle />
          </div>
        </div>
        {canUseNotifications() && (
          <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">Notifications</span>
            <div className="pl-2">
              {isNotificationsGranted ? (
                <Switch
                  className="w-10"
                  onCheckedChange={updateNotificationSettings}
                  // checked={settings.showNotifications}
                />
              ) : (
                <Button
                  variant="default"
                  className="w-fit px-2"
                  onClick={() => {
                    requestNotificationsPermission().then(granted => {
                      if (granted) {
                        updateNotificationSettings(true);
                      }
                    });
                  }}
                >
                  Enable notifications
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 w-full justify-start">
          <span className="text-lg font-semibold">Account</span>
          <div className="flex flex-col gap-1 pl-2">
            <Button
              variant="ghost"
              className="w-fit px-1 md:hover:bg-slate-400/40"
              onClick={handleSignOut}
            >
              LOGOUT
            </Button>
            <Button
              variant="link"
              className="w-fit px-1 md:hover:bg-destructive/40 md:hover:text-destructive-foreground hover:no-underline text-destructive/60 text-sm"
              onClick={handleDeleteUserRequest}
            >
              DELETE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
