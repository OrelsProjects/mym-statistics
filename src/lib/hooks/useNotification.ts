"use client";

import { toast } from "react-toastify";
// import { getUserToken, initMessaging } from "../../../firebase.config";
import { Logger } from "../../logger";
import { canUseNotifications, isMobilePhone } from "../utils/notificationUtils";
import { NotificationData } from "../../models/notification";
import axios from "axios";
import NotificationComponent from "../../components/ui/notification";

export default function useNotification() {
  const showNotification = async (notification: NotificationData) => {
    const notificationComponent = () => NotificationComponent({ notification });
    toast(notificationComponent, {
      autoClose: 3000,
    });
  };

  const didRequestPermission = () => {
    return localStorage.getItem("notificationPermissionRequested") === "true";
  };

  const setPermissionRequested = () => {
    localStorage.setItem("notificationPermissionRequested", "true");
  };

  const isPermissionGranted = () => {
    return Notification?.permission === "granted";
  };

  async function requestNotificationsPermission(): Promise<boolean> {
    if (!canUseNotifications()) {
      return false;
    }
    if (isPermissionGranted()) {
      return true;
    } else {
      // initMessaging();
      const permissionResponse = await Notification.requestPermission();
      return permissionResponse === "granted";
    }
  }

  /**
   * @returns push token or error message
   */
  async function initNotifications(): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      Logger.error("Service worker not supported");
    }
    let pushToken = "";
    try {
      // initMessaging();
      // pushToken = (await getUserToken()) || "no-token";
      // if (isMobilePhone()) {
      //   await axios.patch("/api/user", { pushTokenMobile: pushToken });
      // } else {
      //   await axios.patch("/api/user", { pushToken });
      // }
    } catch (e: any) {
      Logger.error("Failed to get token", {
        data: {
          error: e,
          token: pushToken,
        },
      });
    }
  }

  return {
    showNotification,
    initNotifications,
    isPermissionGranted,
    didRequestPermission,
    setPermissionRequested,
    requestNotificationsPermission,
  };
}
