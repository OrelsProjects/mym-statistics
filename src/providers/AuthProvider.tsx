/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectAuth,
  setUser as setUserAction,
} from "../lib/features/auth/authSlice";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import { setUserEventTracker } from "../eventTracker";
import { setUserLogger } from "../logger";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "../lib/hooks/redux";
import { DefaultSession, SessionUser } from "next-auth";
import { AppUser } from "@prisma/client";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useSelector(selectAuth);
  const { data: session, status } = useSession();

  const setUser = async (user?: SessionUser & DefaultSession["user"]) => {
    try {
      const appUser: AppUser = {
        displayName: user?.name || null,
        email: user?.email || "",
        id: user?.userId || "",
        firstName: "",
        lastName: "",
        webUserId: user?.webUserId || "",
        number: "",
        gender: "",
        isActive: false,
        createdAt: new Date(),
        photoURL: user?.image || "",
      };
      dispatch(setUserAction(appUser));
    } catch (error: any) {
      console.error(error);
      dispatch(setUserAction(null));
    }
  };

  useEffect(() => {
    switch (status) {
      case "authenticated":
        if (session.user) {
          setUser(session.user);
        } else {
          setUser(undefined);
        }

        break;
      case "loading":
        break;
      case "unauthenticated":
        setUser(undefined);
        break;
      default:
        break;
    }
  }, [status]);

  useEffect(() => {
    setUserEventTracker(currentUser);
    setUserLogger(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      if (
        pathname.includes("login") ||
        pathname.includes("register") ||
        pathname === "/" ||
        pathname === "/messages"
      ) {
        router.push("/messages");
      }
    } else {
      if (!pathname.includes("login") && !pathname.includes("register")) {
        router.push("/login");
      }
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loading className="w-20 h-20" />
      </div>
    );
  }

  return children;
}
