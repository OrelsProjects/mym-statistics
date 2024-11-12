"use client";

import React from "react";
import { isMobilePhone } from "../lib/utils/notificationUtils";
import NextTopLoader from "nextjs-toploader";

export default function TopLoaderProvider() {
  return (
    !isMobilePhone() && (
      <NextTopLoader
        color="hsl(var(--primary))"
        initialPosition={0.08}
        crawlSpeed={150}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={1500}
        shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
      />
    )
  );
}
