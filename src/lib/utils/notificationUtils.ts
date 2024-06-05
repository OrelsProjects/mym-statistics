export const canUseNotifications = () => {
  return (
    false &&
    ("Notification" in window || "PushManager" in window) &&
    "serviceWorker" in navigator
  );
};

export const isMobilePhone = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};
