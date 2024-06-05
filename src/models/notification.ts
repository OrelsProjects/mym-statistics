export type NotificationType = "mym-web";

export type NotificationData = {
  title: string;
  type: NotificationType;
  body?: string;
  image?: string;
  onClick?: () => void;
};
