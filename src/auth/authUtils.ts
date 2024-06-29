import { Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import prisma from "../app/api/_db/db";
import loggerServer from "../loggerServer";
import { hash } from "bcrypt";
import { InvalidCredentialsError } from "../models/errors/InvalidCredentialsError";
import { UnknownUserError } from "../models/errors/UnknownUserError";
import UserAlreadyExistsError from "../models/errors/UserAlreadyExistsError";

export const authorize = async (
  credentials: any & {
    email: string;
    password: string;
    displayName: string;
    isSignIn: string;
    referralCode: string;
  },
  req: any,
) => {};

export const getSession = async ({
  session,
  token,
  user,
}: {
  session: Session;
  token: JWT;
  user: AdapterUser;
}) => {
  if (session?.user) {
    session.user.webUserId = token.sub!;
  }

  const appUser = await prisma.appUser.findFirst({
    where: {
      webUserId: token.sub!,
    },
  });

  return {
    ...session,
    user: {
      ...session.user,
      userId: appUser?.id,
    },
  };
};

export const signIn = async (session: any) => {
  try {
    let additionalUserData = {};
    let userInDB = await prisma.appUser.findFirst({
      where: {
        webUserId: session.user.id,
      },
    });

    if (!userInDB) {
      let oldUser = await prisma.appUser.findFirst({
        where: {
          email: session.user.email,
        },
      });
      if (oldUser && oldUser.webUserId !== session.user.id) {
        try {
          const oldUser = await prisma.appUser.update({
            where: {
              email: session.user.email,
            },
            data: {
              webUserId: session.user.id,
              displayName: session.user.name,
              photoURL: session.user.image,
            },
          } as any);
          additionalUserData = { ...oldUser };
        } catch (e: any) {
          loggerServer.error("Error signing in", session.user.id, { error: e });
        }
      } else {
        const newUser = await prisma.appUser.create({
          data: {
            id: session.user.id,
            email: session.user.email || "",
            displayName: session.user.name || "",
            webUserId: session.user.id,
            firstName: session.user.name ? session.user.name.split(" ")[0] : "",
            lastName: session.user.name ? session.user.name.split(" ")[1] : "",
            number: "",
            gender: "",
            isActive: true,
          },
        });
        additionalUserData = { ...newUser };
      }
    }

    return {
      ...session,
      ...additionalUserData,
    };
  } catch (e: any) {
    loggerServer.error("Error signing in", session.user.id, { error: e });
  }
};
