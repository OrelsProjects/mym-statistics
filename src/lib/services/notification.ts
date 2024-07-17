"use client";
// import { getUserToken } from "../../../firebase.config";

function isNotificationSupported() {
  return "Notification" in window;
}

function isPermissionGranted() {
  return Notification.permission === "granted";
}

export async function sendPushNotification(
  title: string,
  body: string,
  image: string,
  token: string,
) {
  if (!isNotificationSupported()) {
    return;
  }

  if (!isPermissionGranted()) {
    return;
  }

  const message = {
    notification: {
      title,
      body,
      image,
    },
    token,
  };
}

export async function requestPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }
  if (isPermissionGranted()) {
    return true;
  } else {
    const permissionResponse = await Notification.requestPermission();
    return permissionResponse === "granted";
  }
}

export function createNotification(title: string, body: string, image: string) {
  if (!isNotificationSupported()) {
    return;
  }
  if (isPermissionGranted()) { 
    new Notification(title, { body, icon: image });
  }
}

/**
 * This function registers the service worker and initializes push notifications
 * @returns
 */
export async function getToken(): Promise<string | undefined> {
  if (!("serviceWorker" in navigator)) {
    return "";
  }
  if (isNotificationSupported()) {
    const permissionGranted = await requestPermission();
    if (!permissionGranted) {
      return ""; // TODO: Throw
    }
  } else {
    return ""; // TODO: Throw
  }

  // const token = await getUserToken();

  // console.log(token);
  // return token;
}
