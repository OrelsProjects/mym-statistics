"use client";

import React from "react";
import "../../../firebase.config";
import type { Viewport } from "next";

import AuthProvider from "../providers/AuthProvider";
import NotificationsProvider from "../providers/NotificationsProvider";
import TopLoaderProvider from "../providers/TopLoaderProvider";
import AnimationProvider from "../providers/AnimationProvider";
import HeightProvider from "../providers/HeightProvider";
import ContentProvider from "../providers/ContentProvider";
import { OngoingCallProvider } from "../providers/OngoingCallProvider";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: RootLayoutProps) {
  return (
    <main>
      <AuthProvider>
        <NotificationsProvider />
        <HeightProvider>
          <ContentProvider>
            <TopLoaderProvider />
            <OngoingCallProvider />
            <AnimationProvider className="2xl:mt-4">{children}</AnimationProvider>
          </ContentProvider>
        </HeightProvider>
      </AuthProvider>
    </main>
  );
}

export const viewport: Viewport = {
  themeColor: "#121212",
};
