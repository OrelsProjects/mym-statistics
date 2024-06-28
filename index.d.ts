declare module "global" {
    interface ReferralOptions {
      referralCode?: string | null;
    }
  
    interface NotificationBody {
      token: string;
      data: Record<string, string>;
    }
  }
  