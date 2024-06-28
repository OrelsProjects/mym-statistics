"use client";

import React, { useEffect } from "react";
import { messaging } from "../../../firebase.config";
import { Messaging, onMessage } from "firebase/messaging";
import { useAppSelector } from "../../lib/hooks/redux";
import { NotificationType } from "../../models/notification";
import useNotification from "../../lib/hooks/useNotification";

const NotificationsProvider = () => {
  const { user } = useAppSelector(state => state.auth);
  const { initNotifications, showNotification } = useNotification();

  useEffect(() => {
    const init = async (messaging: Messaging) => {
      await initNotifications();

      onMessage(messaging, payload => {
        showNotification({
          title: payload.data?.title ?? "",
          body: payload.data?.body ?? "",
          image: payload.data?.image ?? "",
          type: payload.data?.type as NotificationType,
        });
      });
    };
    // if (messaging && user?.settings.showNotifications) {
    //   init(messaging);
    // }
  }, [user, messaging]);

  return <></>;
};

export default NotificationsProvider;
